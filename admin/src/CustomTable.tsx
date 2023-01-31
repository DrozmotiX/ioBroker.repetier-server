/**
 * Created by alex-issi on 01.05.22
 */
import { Delete } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';
import { AddModal } from './components/AddModal';
import { Row } from './components/AddTableDialog';
import { Spacer } from './components/Spacer';

interface CustomTableProps {
	onChange: (id: keyof ioBroker.AdapterConfig, value: { select: string }[]) => void;
	setting: ioBroker.AdapterConfig;
}

export const CustomTable: React.FC<CustomTableProps> = ({ setting, onChange }): JSX.Element => {
	// Translation function
	const { translate: _ } = useI18n();
	// rows of the table
	const [rows, setRows] = useState<
		{
			select: string;
		}[]
	>(setting.tableValues);

	//delete row
	const handleDelete = (index) => {
		const newRows = rows.filter((row, i) => i !== index);
		setRows(newRows);
		onChange('tableValues', newRows);
		console.log(newRows);
	};

	//add row
	const handleAdd = (value: Row | undefined) => {
		if (value) {
			const newRows = [...rows, { select: value.select }];
			setRows(newRows);
			onChange('tableValues', newRows);
		}
	};

	const handleEdit = (value: Row | undefined, index: number) => {
		if (value) {
			const newRows = [...rows];
			newRows[index] = { select: value.select };
			setRows(newRows);
			onChange('tableValues', newRows);
		}
	};

	const random = (): number => Math.floor(Math.random() * 100);

	return (
		<React.Fragment>
			<AddModal mode={'add'} newRow={(value) => handleAdd(value)} />
			<Spacer text={_('Table')} variant={'h1'} />
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
							<TableCell align="center">{_('Name')}</TableCell>
							<TableCell align="center">{_('select')}</TableCell>
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
								<TableCell align="center">{_('Name')}</TableCell>
								<TableCell align="center">{row.select}</TableCell>
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
			<Spacer text={_('Tabelle 2')} />
		</React.Fragment>
	);
};
