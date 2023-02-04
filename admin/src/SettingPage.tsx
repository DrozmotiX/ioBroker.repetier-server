import { useI18n } from 'iobroker-react/hooks';
import React from 'react';
import { CustomTable } from './CustomTable';
import { Grid, FormControl } from '@mui/material';
import { IpAddressInput, PasswordInput } from 'iobroker-react';
import { decrypt, encrypt } from 'iobroker-react/lib/shared/tools';

interface SettingPageProps {
	secret: string;
	onChange: (key: keyof ioBroker.AdapterConfig, value: any) => void;
	settings: ioBroker.AdapterConfig;
}

export const SettingPage: React.FC<SettingPageProps> = ({ secret, onChange, settings }): JSX.Element => {
	const { translate: _ } = useI18n();

	const handleChangeIP = (value) => {
		onChange('ip', value);
	};

	const handleChangeToken = (value) => {
		if (secret) {
			const encryptedPassword = encrypt(secret, value);
			// save the encrypted password
			onChange('token', encryptedPassword);
		}
	};

	const handleDecryption = (value: string) => {
		if (secret) {
			const decryptedValue = decrypt(secret, value);
			return decryptedValue;
		}
		return value;
	};

	// erstelle mir eine funktion die mir die Daten aus dem TreeTable zurückgibt

	return (
		<React.Fragment>
			<Grid
				container
				sx={{
					marginTop: '10px',
					paddingBottom: '15px',
					alignItems: 'center',
					justifyContent: 'center',
					display: 'flex',
				}}
			>
				<FormControl variant="standard" sx={{ m: 1, minWidth: 120, width: '250px' }}>
					<IpAddressInput label={_('ip')} value={settings.ip} onChange={handleChangeIP} />
				</FormControl>

				<PasswordInput
					label={_('token')}
					value={handleDecryption(settings.token)}
					onChange={handleChangeToken}
					sx={{
						formControl: { m: 1, minWidth: 120, width: '250px' },
					}}
				/>
			</Grid>
			<CustomTable setting={settings} onChange={(id, value) => onChange(id, value)} />
		</React.Fragment>
	);
};
