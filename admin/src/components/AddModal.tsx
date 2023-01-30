import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';
import { AddTableDialog, Row } from './AddTableDialog';

export interface AddModalProps {
	newRow: (value: Row | undefined) => void;
}

export const AddModal: React.FC<AddModalProps> = ({ newRow }): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [row, setRow] = useState<Row>();
	const { translate: _ } = useI18n();

	const handleClickAdd = (): void => {
		newRow(row);
		setOpen(false);
	};

	const handleClickOpen = (): void => {
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	return (
		<React.Fragment>
			<Button variant="contained" size="large" color={'primary'} onClick={handleClickOpen}>
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
					<AddTableDialog addRow={(value) => setRow(value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClickAdd}>{_('add')}</Button>
					<Button onClick={handleClose}>{_('Cancel')}</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
};
