/**
 * Created by issi on 31.10.21
 */
import {
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	SelectChangeEvent,
	ListItemText,
	Checkbox,
	TextField,
	Box,
} from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useEffect, useState } from 'react';
export interface Row {
	select: string[];
	value: string;
	type: boolean;
	command: string;
	desc: string;
}

export interface RowProps {
	newRow?: (value: Row) => void;
	oldRow?: Row | undefined;
	mode: 'add' | 'edit';
	options: string[] | undefined;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

export const AddTableDialog: React.FC<RowProps> = ({ mode, newRow, oldRow, options }): JSX.Element => {
	if (!options) {
		options = [];
	}

	const { translate: _ } = useI18n();
	const [row, setRow] = useState<Row>({
		select: ['all'],
		value: '',
		type: false,
		command: '',
		desc: '',
	});
	const [select, setSelect] = React.useState<string[]>(['all']);
	const [type, setType] = React.useState<string>('false');
	const [value, setValue] = React.useState<string>('');
	const [command, setCommand] = React.useState<string>('');
	const [desc, setDesc] = React.useState<string>('');
	const [showValue, setShowValue] = React.useState(true);

	useEffect(() => {
		if (newRow) {
			if (row.type) {
				row.value = '';
			}
			newRow(row);
		}
	}, [row]);

	useEffect(() => {
		if (oldRow) {
			setSelect(oldRow.select);
			setValue(oldRow.value);
			setCommand(oldRow.command);
			setType(JSON.stringify(oldRow.type));
			setDesc(oldRow.desc);
			if (oldRow.type) {
				setShowValue(false);
			} else {
				setShowValue(true);
			}
		}
	}, [oldRow]);

	const handleChange = (event: SelectChangeEvent<typeof select>) => {
		let {
			target: { value },
		} = event;

		if (typeof value === 'string') {
			setSelect(value.split(','));
		} else {
			if (value.length > 1) {
				if (value[0] == 'all') {
					value = value.filter((v) => v !== 'all');
				} else if (value[value.length - 1] === 'all') {
					// wenn ja, dann setze alle werte aus dem options array
					value = ['all'];
				}
				if (mode === 'edit') setRow({ ...oldRow, select: value } as Row);
				if (mode === 'add') setRow({ ...row, select: value });
				setSelect(value);
			} else {
				if (mode === 'edit') setRow({ ...oldRow, select: value } as Row);
				if (mode === 'add') setRow({ ...row, select: value });
				setSelect(value);
			}
		}
	};

	const handleChangeType = (event: SelectChangeEvent) => {
		//ToDO: Reset value if set to false
		const type = JSON.parse(event.target.value);

		if (type) {
			console.log('true');
			setShowValue(false);
			if (mode === 'edit') setRow({ ...oldRow, value: '', type: type } as Row);
			if (mode === 'add') setRow({ ...row, value: '', type: type  });
			setValue('');
			setType(event.target.value);
			// if (mode === 'edit') setRow({ ...oldRow, type: type } as Row);
			// if (mode === 'add') setRow({ ...row, type: type });
		} else {
			setShowValue(true);
			console.log('false');
			setType(event.target.value);
			if (mode === 'edit') setRow({ ...oldRow, type: type } as Row);
			if (mode === 'add') setRow({ ...row, type: type });
		}


	};

	const handleChangeValue = (event) => {
		setValue(event.target.value);
		if (mode === 'edit') setRow({ ...oldRow, value: event.target.value } as Row);
		if (mode === 'add') setRow({ ...row, value: event.target.value });
	};
	const handleChangeCommand = (event) => {
		setCommand(event.target.value);
		if (mode === 'edit') setRow({ ...oldRow, command: event.target.value } as Row);
		if (mode === 'add') setRow({ ...row, command: event.target.value });
	};
	const handleChangeDesc = (event) => {
		setDesc(event.target.value);
		if (mode === 'edit') setRow({ ...oldRow, desc: event.target.value } as Row);
		if (mode === 'add') setRow({ ...row, desc: event.target.value });
	};

	return (
		<React.Fragment>
			<Grid
				container
				sx={{
					marginTop: '10px',
					paddingBottom: '15px',
					alignItems: 'center',
					justifyContent: 'space-around',
					display: 'flex',
				}}
			>
				<FormControl fullWidth>
					<InputLabel id="select-label">printer</InputLabel>
					<Select
						labelId="printer-multiple-select-label"
						id="printer-multiple-select"
						multiple
						value={select}
						onChange={handleChange}
						input={<OutlinedInput label="Tag" />}
						renderValue={(selected) => selected.join(', ')}
						MenuProps={MenuProps}
					>
						{options.map((name) => (
							<MenuItem key={name} value={name}>
								<Checkbox checked={select.indexOf(name) > -1} />
								<ListItemText primary={name} />
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			<Grid
				container
				sx={{
					marginTop: '10px',
					paddingBottom: '15px',
					alignItems: 'center',
					justifyContent: 'space-around',
					display: 'flex',
				}}
			>
				<Box>
					<FormControl variant="standard" sx={{ m: 1, minWidth: 120, width: '250px' }}>
						<TextField
							id="command-input"
							label="Command"
							variant="outlined"
							value={command}
							onChange={(e) => handleChangeCommand(e)}
						/>
					</FormControl>
					<FormControl variant="standard" sx={{ m: 1, minWidth: 120, width: '250px' }}>
						<TextField
							id="description-input"
							label="Description"
							variant="outlined"
							value={desc}
							onChange={handleChangeDesc}
						/>
					</FormControl>
				</Box>
				<Box>
					<FormControl sx={{ m: 1, minWidth: 120, width: '250px' }}>
						<InputLabel id="select-type-label">{_('type')}</InputLabel>
						<Select
							labelId="select-type-label"
							id="select-type"
							value={type}
							onChange={handleChangeType}
							label="type"
						>
							<MenuItem value={'false'}>{_(`Send defined value`)}</MenuItem>
							<MenuItem value={'true'}>{_('Send state value')}</MenuItem>
						</Select>
					</FormControl>
					{showValue ? (
						<FormControl variant="standard" sx={{ m: 1, minWidth: 120, width: '250px' }}>
							<TextField
								id="outlined-basic"
								label="Value"
								variant="outlined"
								value={value}
								onChange={handleChangeValue}
							/>
						</FormControl>
					) : null}
				</Box>
			</Grid>
		</React.Fragment>
	);
};
