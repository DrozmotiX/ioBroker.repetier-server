import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useConnection, useDialogs, useGlobals, useI18n } from 'iobroker-react/hooks';
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
	const { showSelectId } = useDialogs();

	const invokeCommand = React.useCallback(async () => {
		const result = await connection.sendTo(namespace, 'doSomething', {});
		if (!result) console.error('Nope!');
		console.log('invokeCommand');
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

	const handleClickOpen = (): void => {
		setOpen(true);
		// const test = await invokeCommand();
		// // console.log(test);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	return (
		<React.Fragment>
			{mode === 'add' ? (
				<React.Fragment>
					<Button
						variant="contained"
						size="medium"
						color={'primary'}
						onClick={handleClickOpen}
						sx={{
							'&:hover': {
								backgroundColor: '#3f51b5',
							},
						}}
					>
						{_('add')}
					</Button>
					<Dialog open={open} onClose={handleClose}>
						<DialogTitle
							sx={{
								textAlignLast: 'center',
								fontSize: '1.4rem',
							}}
						>
							{_('new Table Row')}
						</DialogTitle>
						<DialogContent
							sx={{
								display: 'flex',
								flexWrap: 'wrap',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<AddTableDialog newRow={(value) => setRow(value)} mode={'add'} />
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
							<AddTableDialog newRow={(value) => setRowEdit(value)} oldRow={oldRow} mode={'edit'} />
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
