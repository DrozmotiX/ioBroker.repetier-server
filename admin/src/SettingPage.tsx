import { TreeColumnProps, TreeDataProps, TreeTable } from 'iobroker-react';
import { useI18n } from 'iobroker-react/hooks';
import React, {useEffect} from 'react';
import { CustomTable } from './CustomTable';
import {Button} from "@mui/material";

interface SettingPageProps {
	changeSetting: (key: keyof ioBroker.AdapterConfig, value: any) => void;
	settings: ioBroker.AdapterConfig;
}

const columns: TreeColumnProps[] = [
	{
		title: 'Name',
		field: 'fieldIdInData',
		editable: true,
		subStyle: { color: '#00FF00' },
		subField: 'subFieldData',
	},
	{ title: 'Text', field: 'text', editable: true, type: 'string' },
	{ title: 'OID', field: 'oid', editable: true, type: 'oid' },
	{ title: 'Color', field: 'color', editable: true, type: 'color' },
	{ title: 'Numeric', field: 'numeric', editable: true, type: 'numeric' },
	{ title: 'Boolean', field: 'boolean', editable: true, type: 'boolean' },
	{
		title: 'Select',
		field: 'select',
		editable: true,
		type: 'string',
		lookup: { 1: 'one', 2: 'two', 3: 'three' },
	},
];

const newLine = {
	id: Math.random().toString(36).substr(2, 9), // create random id
	fieldIdInData: 'your data',
	oid: 'myOID',
	color: '#ff0000',
	numeric: 123,
	select: 'number',
	boolean: true,
	text: 'your data',
};

export const SettingPage: React.FC<SettingPageProps> = ({ changeSetting, settings }): JSX.Element => {
	const { translate: _ } = useI18n();
	const [value, setValue] = React.useState(0);
	const [click, setClick] = React.useState(false)
	const [treeData, setTreeData] = React.useState<TreeDataProps[]>([
		{
			id: '1',
			fieldIdInData: 'Test1',
			oid: 'test.0.test1',
			color: '#ff0000',
			numeric: 1,
			text: 'Text1',
			boolean: true,
			select: '1',
		},
		{
			id: '2',
			fieldIdInData: 'Test2',
			oid: 'test.0.test2',
			color: '#00ff00',
			numeric: 2,
			text: 'Text2',
			parentId: '1',
			subFieldData: 'Child',
			boolean: false,
			select: '2',
		},
		{
			id: '3',
			fieldIdInData: 'Test3',
			oid: 'test.0.test3',
			color: '#0000ff',
			numeric: 3,
			text: 'Text3',
			boolean: true,
			select: '3',
		},
	]);

	useEffect(() => {
		const data = [
			...treeData,
			{
				id: '4',
				fieldIdInData: 'Test4',
				oid: 'test.0.test4',
				color: '#0000ff',
				numeric: 4,
				text: 'Text4',
				boolean: true,
				select: '',
			},
		]
		setTreeData(data)

	},[click])

	const handleClick = () => {
		setClick(!click)
	}


	return (
		<React.Fragment>
				<CustomTable setting={settings} onChange={(id, value) => changeSetting(id, value)} />
			<Button onClick={handleClick} >Test</Button>
				<br />
				TreeTable
				<TreeTable
					columns={columns}
					data={treeData}
					newLineData={newLine}
					newData={setTreeData}
					noAdd={false}
					noEdit={false}
					noDelete={false}
				/>
		</React.Fragment>
	);
};
