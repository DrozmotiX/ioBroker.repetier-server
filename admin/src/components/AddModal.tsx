import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useConnection, useGlobals, useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';
import { AddTableDialog, Row } from './AddTableDialog';
import { Edit } from '@mui/icons-material';

export interface AddModalProps {
	mode: 'add' | 'edit';
	editRow?: (value: Row | undefined, index: number) => void;
	oldRow?: Row;
	index?: number;
	newRow?: (value: Row | undefined) => void;
}

export const AddModal: React.FC<AddModalProps> = ({ newRow, index, mode, editRow, oldRow }): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [row, setRow] = useState<Row>();
	const [rowEdit, setRowEdit] = useState<Row>();
	const { translate: _ } = useI18n();
	const connection = useConnection();
	const { namespace } = useGlobals();
	const [selectOptions, setSelectOptions] = useState<string[]>();

	const getPrinterList = React.useCallback(async () => {
		const result = await connection.sendTo(namespace, 'getPrinterList', ['getPrinterList']);
		if (!result) console.error('Nope!');

		setSelectOptions(result);
	}, [connection, namespace]);

	const handleClickAdd = (): void => {
		if (newRow) {
			newRow(row);
		}
		setOpen(false);
	};

	const handleClickEdit = (): void => {
		if (editRow) {
			if (index !== undefined) editRow(rowEdit, index);
		}
		setOpen(false);
	};

	const handleClickOpen = async (): Promise<void> => {
		setOpen(true);
		await getPrinterList();
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	return (
		<React.Fragment>
			{mode === 'add' ? (
				<React.Fragment>
					<Button variant="contained" size="medium" color={'primary'} onClick={handleClickOpen}>
						{_('add')}
					</Button>
					<Dialog open={open} onClose={handleClose}>
						<DialogTitle
							sx={{
								textAlignLast: 'center',
								fontSize: '1.4rem',
							}}
						>
							{_('Add custom command')}
						</DialogTitle>
						<DialogContent
							sx={{
								display: 'flex',
								flexWrap: 'wrap',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<AddTableDialog newRow={(value) => setRow(value)} options={selectOptions} />
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClickAdd}>{_('add')}</Button>
							<Button onClick={handleClose}>{_('Cancel')}</Button>
						</DialogActions>
					</Dialog>
				</React.Fragment>
			) : (
				<>
					<IconButton aria-label="edit" onClick={handleClickOpen}>
						<Edit sx={{ color: '#090cec' }} />
					</IconButton>
					<Dialog open={open} onClose={handleClose}>
						<DialogTitle
							sx={{
								textAlignLast: 'center',
								fontSize: '1.4rem',
							}}
						>
							{_('edit Table Row')}
						</DialogTitle>
						<DialogContent
							sx={{
								display: 'flex',
								flexWrap: 'wrap',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<AddTableDialog
								newRow={(value) => setRowEdit(value)}
								oldRow={oldRow}
								options={selectOptions}
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClickEdit}>{_('edit')}</Button>
							<Button onClick={handleClose}>{_('Cancel')}</Button>
						</DialogActions>
					</Dialog>
				</>
			)}
		</React.Fragment>
	);
};
