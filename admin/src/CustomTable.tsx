/**
 * Created by alex-issi on 01.05.22
 */
import { Delete } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';
import { AddModal } from './components/AddModal';
import { Row } from './components/AddTableDialog';

// import { Spacer } from './components/Spacer';

interface CustomTableProps {
	onChange: (
		id: keyof ioBroker.AdapterConfig,
		value: { select: string[]; value: string; type: boolean; command: string; desc: string }[],
	) => void;
	setting: ioBroker.AdapterConfig;
}

export const CustomTable: React.FC<CustomTableProps> = ({ setting, onChange }): JSX.Element => {
	// Translation function
	const { translate: _ } = useI18n();
	// rows of the table
	const [rows, setRows] = useState<
		{
			select: string[];
			value: string;
			type: boolean;
			command: string;
			desc: string;
		}[]
	>(setting.customGCodeCommands);

	//delete row
	const handleDelete = (index) => {
		const newRows = rows.filter((row, i) => i !== index);
		setRows(newRows);
		onChange('customGCodeCommands', newRows);
		console.log(newRows);
	};

	//add row
	const handleAdd = (value: Row | undefined) => {
		if (value) {
			const newRows = [
				...rows,
				{
					select: value.select,
					value: value.value,
					type: value.type,
					command: value.command,
					desc: value.desc,
				},
			];
			console.log(`customGCodeCommands `, value);
			setRows(newRows);
			onChange('customGCodeCommands', newRows);
		}
	};

	const handleEdit = (value: Row | undefined, index: number) => {
		if (value) {
			const newRows = [...rows];
			newRows[index] = {
				select: value.select,
				value: value.value,
				type: value.type,
				command: value.command,
				desc: value.desc,
			};
			setRows(newRows);
			onChange('customGCodeCommands', newRows);
		}
	};

	const random = (): number => Math.floor(Math.random() * 100);

	return (
		<React.Fragment>
			<AddModal mode={'add'} newRow={(value) => handleAdd(value)} />
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="medium" aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell
								align="center"
								sx={{
									fontWeight: 'bold',
									width: '50px',
								}}
							>
								{_('Id')}
							</TableCell>
							<TableCell align="center">{_('Command')}</TableCell>
							<TableCell align="center">{_('Description')}</TableCell>
							<TableCell align="center">{_('type')}</TableCell>
							<TableCell align="center">{_('value')}</TableCell>
							<TableCell align="center">{_('printer(s)')}</TableCell>
							<TableCell align="center">{_('Actions')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow
								key={index + random() + random()}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell id={'id'} align="center">
									{index + 1}
								</TableCell>
								<TableCell align="center">{row.command}</TableCell>
								<TableCell align="center">{row.desc}</TableCell>
								<TableCell align="center">
									{row.type ? _('Send state value') : _(`Send defined value`)}
								</TableCell>
								<TableCell align="center">{row.value}</TableCell>
								<TableCell align="center">{row.select.join(', ')}</TableCell>
								<TableCell align={'center'}>
									<AddModal mode={'edit'} editRow={handleEdit} oldRow={row} index={index} />
									<IconButton aria-label="delete" onClick={() => handleDelete(index)}>
										<Delete sx={{ color: 'red' }} />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</React.Fragment>
	);
};
