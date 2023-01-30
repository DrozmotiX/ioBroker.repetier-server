import { FormControl, TextField, Tooltip } from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';

interface NumberInputProps {
	min: number;
	max: number;
	label: string;
	tooltip: string;
	defaultValue?: number;
	value: number;
	sx: any;
	createNewConfig: (value: number) => void;
}
/***
 * need Funktion and useState hook
 *
 *
 *  const [numberValue, setNumberValue] = useState(0);
 *
 *
 *  const handeleNumber = (attr, value) => {
 *
 * 		setNumberValue(value);
 *
 * 		fullConfig.config.$sectionAttr$[attr] = value
 *
 * 	};
 */
export const NumberInput: React.FC<NumberInputProps> = ({
	min,
	max,
	label,
	tooltip,
	defaultValue,
	value,
	sx,
	createNewConfig,
}): JSX.Element => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [values, setValues] = useState<number>(defaultValue ?? 80);
	const { translate: _ } = useI18n();

	return (
		<React.Fragment>
			<FormControl variant="outlined">
				<Tooltip title={_(`${tooltip}`)} arrow>
					<TextField
						variant="outlined"
						type="number"
						label={_(`${label}`)}
						value={value}
						color={'success'}
						sx={sx}
						onChange={(e) => {
							const value = e.target.value;
							if (value !== '') {
								let newValue = parseInt(e.target.value, 10);
								if (newValue > max) newValue = max;
								if (newValue < min) newValue = min;
								setValues(newValue);
								createNewConfig(newValue);
							} else {
								const value = min;
								setValues(value);
								createNewConfig(value);
							}
						}}
					/>
				</Tooltip>
			</FormControl>
		</React.Fragment>
	);
};
