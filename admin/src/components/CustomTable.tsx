///**
// * Created by alex-issi on 01.05.22
// */
//import { Delete, Edit, ToggleOff, ToggleOn } from '@mui/icons-material';
//import {
//	IconButton,
//	Paper,
//	Table,
//	TableBody,
//	TableCell,
//	TableContainer,
//	TableHead,
//	TableRow,
//	Tooltip,
//} from '@mui/material';
//import { useAdapter, useI18n } from 'iobroker-react/hooks';
//import React, { useState } from 'react';
////import { AddModal } from './modal/AddModal';
////import { DeleteConfirmModal } from './modal/DeleteConfirmModal';
////import { EditModal } from './modal/EditModal';
//
//interface CustomTableProps {
//	onChange: (id: keyof ioBroker.AdapterConfig, value: any) => void;
//	setting: ioBroker.AdapterConfig;
//	mqtt: {
//		mqttEnabled: boolean;
//		mqttAvailable: boolean;
//	};
//}
//
//let newRow: any = [];
//
//export const CustomTable: React.FC<CustomTableProps> = ({ setting, onChange, mqtt }): JSX.Element => {
//	const { alive } = useAdapter();
//
//	// Translation function
//	const { translate: _ } = useI18n();
//	// rows of the table
//	const [rows, setRows] = useState<ioBroker.Devices[]>(setting.devices.length === 0 ? newRow : setting.devices);
//
//		const [editModal, setEditModal] = useState<{
//			open: boolean;
//			index: number | null;
//			oldRow?: ioBroker.Devices;
//		}>({
//			open: false,
//			index: null,
//			oldRow: undefined,
//		});
//		const [showConfirmDialog, setShowConfirmDialog] = useState({
//			open: false,
//			name: '',
//		});
//
//		//delete row
//		const handleDeleteRow = (name: string): void => {
//			const newRows = rows.filter((row) => row.name !== name);
//			setRows(newRows);
//			newRow = [];
//			setShowConfirmDialog({ open: false, name: '' });
//			onChange('devices', newRows);
//		};
//
//		//add row
//		const handleAdd = (value: ioBroker.Devices) => {
//			if (newRow.length === 0) {
//				newRow = [...rows];
//			}
//			newRow.push(value);
//			setRows(newRow);
//			onChange('devices', newRow);
//		};
//
//		//edit row
//		const handleEdit = (value: ioBroker.Devices, index: number | null) => {
//			const newRows = [...rows];
//			if (index !== null) {
//				newRows[index] = value;
//			}
//			setRows(newRows);
//			onChange('devices', newRows);
//		};
//
//	const random = (): number => Math.floor(Math.random() * 100);
//
//	return (
//		<React.Fragment>
//			<DeleteConfirmModal
//				show={showConfirmDialog.open}
//				name={showConfirmDialog.name}
//				onClose={() => setShowConfirmDialog({ open: false, name: '' })}
//				onDelete={(name) => handleDeleteRow(name)}
//			/>
//			<AddModal alive={alive} newRow={(value) => handleAdd(value)} mqtt={mqtt} currentRows={rows} />
//			<EditModal
//				alive={alive}
//				newRow={(editRows, index) => handleEdit(editRows, index)}
//				currentRows={rows}
//				oldRow={editModal.oldRow}
//				open={editModal.open}
//				onClose={() => setEditModal({ index: null, open: false })}
//				index={editModal.index}
//				mqtt={mqtt}
//			/>
//			<TableContainer component={Paper}>
//				<Table sx={{ minWidth: 650 }} size="small" aria-label={_('deviceTable')}>
//					<TableHead>
//						<TableRow>
//							<TableCell align={'center'} sx={{ width: '20%' }}>
//								{_('name')}
//							</TableCell>
//							<TableCell align={'center'} sx={{ width: '20%' }}>
//								{_('ip')}
//							</TableCell>
//							<TableCell align={'center'} sx={{ width: '10%' }}>
//								{_('port')}
//							</TableCell>
//							{mqtt.mqttEnabled && mqtt.mqttAvailable && (
//								<React.Fragment>
//									<TableCell align={'center'} sx={{ width: '20%' }}>
//										{_('topic')}
//									</TableCell>
//									<TableCell align={'center'} sx={{ width: '20%' }}>
//										{_('mqttEnabled')}
//									</TableCell>
//								</React.Fragment>
//							)}
//							<TableCell align={'center'} sx={{ width: '10%' }}>
//								{_('enabled')}
//							</TableCell>
//							<TableCell align={'center'} sx={{ width: '10%' }}>
//								{_('actions')}
//							</TableCell>
//						</TableRow>
//					</TableHead>
//					<TableBody>
//						{rows.map((row, index) => (
//							<TableRow
//								key={row.name + random() + random()}
//								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
//							>
//								<TableCell align={'center'}>{row.name}</TableCell>
//								<TableCell align="center">{row.ip}</TableCell>
//								<TableCell align="center">{row.port}</TableCell>
//								{mqtt.mqttEnabled && mqtt.mqttAvailable ? (
//									<React.Fragment>
//										<TableCell align="center">{row.topic}</TableCell>
//										<TableCell align="center">
//											{row.mqttEnabled ? (
//												<ToggleOn sx={{ color: 'green' }} />
//											) : (
//												<ToggleOff sx={{ color: 'red' }} />
//											)}
//										</TableCell>
//									</React.Fragment>
//								) : null}
//								<TableCell align="center">
//									{row.enabled ? (
//										<ToggleOn sx={{ color: 'green' }} />
//									) : (
//										<ToggleOff sx={{ color: 'red' }} />
//									)}
//								</TableCell>
//								<TableCell align={'center'}>
//									<Tooltip title={_('edit')} placement={'left'} arrow>
//										<IconButton
//											aria-label={_('edit')}
//											//											onClick={() =>
//											////												setEditModal({
//											////													index: index,
//											////													open: true,
//											////													oldRow: row,
//											////												})
//											//											}
//										>
//											<Edit sx={{ color: 'green' }} />
//										</IconButton>
//									</Tooltip>
//									<Tooltip title={_('delete')} placement={'right'} arrow>
//										<IconButton
//											aria-label={_('delete')}
//											//											onClick={() =>
//											////												setShowConfirmDialog({
//											////													open: true,
//											////													name: row.name,
//											////												})
//											//											}
//										>
//											<Delete sx={{ color: 'red' }} />
//										</IconButton>
//									</Tooltip>
//								</TableCell>
//							</TableRow>
//						))}
//					</TableBody>
//				</Table>
//			</TableContainer>
//		</React.Fragment>
//	);
//};
