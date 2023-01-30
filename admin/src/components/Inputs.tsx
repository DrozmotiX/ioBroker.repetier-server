/**
 * Created by alex-issi on 01.05.22
 */
import { TextField, Tooltip } from '@mui/material';
import React from 'react';
import { useI18n } from 'iobroker-react/hooks';

export interface InputsProps {
	id: string;
	settinKey: string;
	tooltip?: string;
	onChange: (id: string, settinKey: string, value: string) => void;
	settings: string;
	sx: {
		[key: string]: any;
	};
}

export const Inputs: React.FC<InputsProps> = ({ id, settinKey, tooltip, settings, onChange, sx }): JSX.Element => {
	const { translate: _ } = useI18n();

	return (
		<React.Fragment>
			<Tooltip title={_(tooltip ? tooltip : '')} arrow>
				<TextField
					//label={_(id)}
					placeholder={_(id)}
					sx={sx}
					value={settings}
					onChange={(event) => {
						onChange(id, settinKey, event.target.value);
					}}
				/>
			</Tooltip>
		</React.Fragment>
	);
};
