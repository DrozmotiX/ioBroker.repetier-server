/**
 * Created by issi on 31.10.21
 */
import { FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useEffect, useState } from 'react';

export interface Row {
	select: string;
}

export interface RowProps {
	newRow?: (value: Row) => void;
	oldRow?: Row;
	mode: 'add' | 'edit';
}

export const AddTableDialog: React.FC<RowProps> = ({ mode, newRow, oldRow }): JSX.Element => {
	const { translate: _ } = useI18n();
	const [row, setRow] = useState({
		select: '0',
	});
	const [select, setSelect] = useState<string>('');

	useEffect(() => {
		if (newRow) {
			newRow(row);
		}
	}, [row]);

	useEffect(() => {
		if (oldRow) {
			setSelect(oldRow.select);
		}
	}, [oldRow]);

	const handleChangeSelect = (event: SelectChangeEvent<typeof select>): void => {
		if (mode === 'edit') {
			setRow({ ...oldRow, select: event.target.value as string });
			setSelect(event.target.value as string);
		} else {
			setRow({ ...row, select: event.target.value as string });
			setSelect(event.target.value as string);
		}
	};

	// function that returns random select options
	const getSelectOptions = () => {
		const options = {};
		for (let i = 0; i < 10; i++) {
			options[i] = `Option ${i}`;
		}
		return options;
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
					flexWrap: 'nowrap',
					flexDirection: 'row',
				}}
			>
				<FormControl sx={{ m: 1, minWidth: 150 }}>
					<InputLabel id="demo-dialog-select-label">Age</InputLabel>
					<Select
						labelId="demo-dialog-select-label"
						id="demo-dialog-select"
						value={select}
						onChange={(event) => {
							handleChangeSelect(event);
						}}
						input={<OutlinedInput label="Age" />}
					>
						<MenuItem disabled value="">
							<em>None</em>
						</MenuItem>
						{Object.keys(getSelectOptions()).map((key) => (
							<MenuItem key={key} value={key}>
								{getSelectOptions()[key]}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
		</React.Fragment>
	);
};
