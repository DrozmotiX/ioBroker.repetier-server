/**
 * Created by issi on 31.10.21
 */
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	OutlinedInput,
	TextField,
	Tooltip,
} from '@mui/material';
import { useI18n, useIoBrokerObject } from 'iobroker-react/hooks';
import { decrypt, encrypt } from 'iobroker-react/lib/shared/tools';
import React, { useEffect, useState } from 'react';
import { NumberInput } from './NumberInput';

export interface Row {
	ip: string;
	port: number;
	password: string;
	name: string;
}

export interface RowProps {
	addRow: (value: Row) => void;
}

interface valuesProps {
	ip: string | any[];
	password: string;
	showPassword: boolean;
}

const allowedInputRegex = /^\d*\.?\d*\.?\d*\.?\d*$/;
const ipRegex = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?!$)|$)){4}$/; //regex from https://regex101.com/library/ChFXjy

export const AddTableDialog: React.FC<RowProps> = ({ addRow }): JSX.Element => {
	const { translate: _ } = useI18n();
	const [valide, setValide] = useState<boolean>(true);
	const [values, setValues] = useState<valuesProps>({
		ip: '',
		password: '',
		showPassword: false,
	});

	const [systemConfigObj] = useIoBrokerObject('system.config');
	const secret = systemConfigObj?.native?.secret || 'Zgfr56gFe87jJOM';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [numberValue, setNumberValue] = useState<number>(80);
	const [name, setName] = useState<string>('');
	const [error, setError] = useState<boolean>(true);
	const [newRow, setNewRow] = useState({
		name: '',
		ip: '',
		port: 80,
		password: '',
	});

	useEffect(() => {
		addRow(newRow);
	}, [newRow]);

	/**
	 * Password
	 */
	const handleChangePW =
		(attr: string) =>
		(event: { target: { value: any } }): void => {
			setValues({ ...values, [attr]: encrypt(secret, event.target.value) });
			setNewRow({ ...newRow, [attr]: encrypt(secret, event.target.value) });
		};

	const handleClickShowPassword = (): void => {
		setValues({ ...values, showPassword: !values.showPassword });
	};

	const handeleNumber = (attr: string, value: React.SetStateAction<number>): void => {
		//		setNumberValue(value);
		if (typeof value === 'number') {
			setNewRow({ ...newRow, [attr]: value });
		}
	};

	const handleIpAddress = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		newValue: string | any[],
	): void => {
		const length = newValue.length;
		const index = newValue.lastIndexOf('.') + 1;
		let noOfDots = 0;
		if (typeof newValue === 'string') {
			noOfDots = newValue.split('.').length - 1;
		}
		let updatedVal: string | any[] = '';
		if (length !== index && noOfDots < 3 && values.ip.length < length && (length - index) % 3 == 0) {
			updatedVal = newValue + '.';
		} else if (noOfDots > 3 || length - index > 3) {
			if (typeof newValue === 'string') {
				updatedVal = newValue.substring(0, length - 1);
			}
		} else {
			updatedVal = newValue;
		}
		setValues({ ...values, ip: updatedVal });

		if (updatedVal !== undefined || updatedVal !== '') {
			if (typeof updatedVal !== 'string' || updatedVal?.match(ipRegex)) {
				// valid
				if (typeof updatedVal === 'string') {
					setNewRow({ ...newRow, ip: updatedVal });
				}
				setValide(false);
			} else {
				// invalid
				setValide(true);
			}
		}
	};

	const handleChangeName = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
		const newName: string = event.target.value;

		if (newName !== '') {
			setName(newName);
			setNewRow({ ...newRow, name: newName });
			setError(false);
		} else {
			setName('');
			setNewRow({ ...newRow, name: '' });
			setError(true);
		}
	};

	return (
		<React.Fragment>
			<Grid
				container
				spacing={3}
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
				<Tooltip title={_('tooltipTabletName')} arrow>
					<TextField
						required
						error={error}
						label={_('Name')}
						color="success"
						value={name}
						type={'text'}
						placeholder="my Name"
						inputProps={{
							maxLength: 20,
						}}
						onChange={(event) => {
							handleChangeName(event);
						}}
					/>
				</Tooltip>
			</Grid>
			<Grid
				container
				spacing={3}
				sx={{
					marginTop: '0',
					paddingBottom: '15px',
					alignItems: 'center',
					justifyContent: 'space-around',
					display: 'flex',
					flexWrap: 'nowrap',
					flexDirection: 'row',
				}}
			>
				<React.Fragment>
					<FormControl variant="outlined">
						<Tooltip title={_('tooltipIp')} arrow>
							<TextField
								required
								variant="outlined"
								error={valide}
								color="success"
								label={_('ipAddress')}
								value={values.ip}
								type="text"
								placeholder="192.0.0.1"
								sx={{ width: '23ch', margin: 1 }}
								inputProps={{
									maxLength: 15,
								}}
								onChange={(e) => {
									const newValue = e.target.value;

									if (allowedInputRegex.test(newValue)) {
										handleIpAddress(e, newValue);
									}
								}}
							/>
						</Tooltip>
					</FormControl>
					<NumberInput
						min={0}
						max={99999}
						label={'port'}
						tooltip={'tooltipPort'}
						sx={{ width: '12ch', margin: 1, textAlignLast: 'center' }}
						value={newRow.port}
						createNewConfig={(value) => handeleNumber('port', value)}
					/>
					<FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
						<InputLabel htmlFor="outlined-adornment-password">{_('Password')}</InputLabel>
						<Tooltip title={_('tooltipPassword')} arrow>
							<OutlinedInput
								id="outlined-adornment-password"
								type={values.showPassword ? 'text' : 'password'}
								value={decrypt(secret, values.password)}
								onChange={handleChangePW('password')}
								endAdornment={
									<InputAdornment position="end">
										<IconButton
											aria-label="toggle password visibility"
											onClick={handleClickShowPassword}
											edge="end"
										>
											{values.showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								}
								label="Password"
							/>
						</Tooltip>
					</FormControl>
				</React.Fragment>
			</Grid>
		</React.Fragment>
	);
};
