/**
 * Created by alex-issi on 01.05.22
 */
import { Delete } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useI18n, useIoBrokerObject } from 'iobroker-react/hooks';
import { encrypt } from 'iobroker-react/lib/shared/tools';
import React, { useState } from 'react';
import { AddModal } from './components/AddModal';
import { Row } from './components/AddTableDialog';

interface CustomTableProps {
	onChange: (
		id: keyof ioBroker.AdapterConfig,
		value: { name: string; ip: string; port: number; password: string }[],
	) => void;
	setting: ioBroker.AdapterConfig;
}

export const CustomTable: React.FC<CustomTableProps> = ({ setting, onChange }): JSX.Element => {
	// System Secret for encryption
	const [systemConfigObj] = useIoBrokerObject('system.config');
	const secret = systemConfigObj?.native?.secret || 'Zgfr56gFe87jJOM';
	// Translation function
	const { translate: _ } = useI18n();
	// rows of the table
	const [rows, setRows] = useState([]);

	//delete row
	// const handleDelete = (name: string) => {
	// 	const newRows = rows.filter((row) => row.name !== name);
	// 	setRows(newRows);
	// 	onChange('tableValues', newRows);
	// };
	//
	// //add row
	// const handleAdd = (value: Row | undefined) => {
	// 	if (value) {
	// 		const newRows = [...rows, value];
	// 		setRows(newRows);
	// 		onChange('tableValues', newRows);
	// 	}
	//};

	const random = (): number => Math.floor(Math.random() * 100);

	 return (
		<h1>test</h1>
	// 	<React.Fragment>
	// 		<AddModal newRow={(value) => handleAdd(value)} />
	// 		<TableContainer component={Paper}>
	// 			<Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
	// 				<TableHead>
	// 					<TableRow>
	// 						<TableCell align="center">{_('Name')}</TableCell>
	// 						<TableCell align="center">{_('IP')}</TableCell>
	// 						<TableCell align="center">{_('Port')}</TableCell>
	// 						<TableCell align="center">{_('Password')}</TableCell>
	// 						<TableCell align="center">{_('Action')}</TableCell>
	// 					</TableRow>
	// 				</TableHead>
	// 				<TableBody>
	// 					{rows.map((row, index) => (
	// 						<TableRow
	// 							key={row.name + random()}
	// 							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
	// 						>
	// 							<TableCell id={'name'} align="center">
	// 								{row.name}
	// 							</TableCell>
	// 							<TableCell align="center">{row.ip}</TableCell>
	// 							<TableCell align="center">{row.port}</TableCell>
	// 							<TableCell align="center">{encrypt(secret, row.password)}</TableCell>
	// 							<TableCell align={'center'}>
	// 								<IconButton aria-label="delete" onClick={() => handleDelete(row.name)}>
	// 									<Delete sx={{ color: 'red' }} />
	// 								</IconButton>
	// 							</TableCell>
	// 						</TableRow>
	// 					))}
	// 				</TableBody>
	// 			</Table>
	// 		</TableContainer>
	// 	</React.Fragment>
	)
};
