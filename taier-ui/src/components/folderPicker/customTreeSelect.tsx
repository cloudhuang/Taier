/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react';
import { omit } from 'lodash';
import { TreeSelect, Input } from 'antd';

import type { TreeSelectProps } from 'antd/lib/tree-select';
import { Icon } from '@dtinsight/molecule/esm/components';
import type molecule from '@dtinsight/molecule';

const { TreeNode } = TreeSelect;

export interface CustomTreeSelectProps extends Omit<TreeSelectProps, 'treeData'> {
	value?: number;
	treeData?: molecule.model.IFolderTreeNodeProps;
	onChange?: TreeSelectProps['onChange'];
	nodeNameField?: string;
	showFile: boolean;
}

/**
 * 解决使用异步加载数据情况下，模糊搜索时展示id的问题
 * 使用 Input 和 TreeSelect 组件分别承担 数据收集和选择、展示的功能
 */
export default function CustomTreeSelect(props: CustomTreeSelectProps) {
	const { value, showFile, treeData, nodeNameField, onChange } = props;
	// 表单收集数据时真正的值，兼容 initialValue
	const [realValue, setRealValue] = useState(value);
	const [showName, setShowName] = useState(value);

	useEffect(() => {
		setRealValue(value);
		setShowName(value);
	}, [value]);

	const onTreeChange = (v: number, label: React.ReactNode[], extra: any) => {
		if (onChange) {
			onChange(v, label, extra);
		}
		setRealValue(v);
	};

	const updateShowName = (_: any, node: any) => {
		const nextNodeNameField = nodeNameField ?? 'name';
		setShowName(node.props?.[nextNodeNameField]);
	};

	const renderIcon = (isShowFile: boolean, type: string) => {
		if (isShowFile) {
			return type === 'file' ? <Icon type="file" /> : <Icon type="folder" />;
		}
		return null;
	};

	// TODO: 将generateTreeNodes暴露出去以兼容不同的数据格式
	const generateTreeNodes = () => {
		const loop = (data: molecule.model.IFolderTreeNodeProps) => {
			const { createUser, id, name, type } = data?.data || {};
			const isLeaf = type === 'file';
			if (!showFile && type === 'file') return null;
			return (
				<TreeNode
					title={
						<span title={name}>
							{name}&nbsp;
							<i className="item-tooltip" title={createUser}>
								<span className="text-ccc">{createUser}</span>
							</i>
						</span>
					}
					value={id}
					name={name}
					dataRef={data}
					key={id}
					isLeaf={isLeaf}
					icon={renderIcon(showFile, type)}
				>
					{data?.children?.map((o) => loop(o))}
				</TreeNode>
			);
		};
		return treeData ? loop(treeData) : null;
	};

	return (
		<>
			<Input type="hidden" value={realValue} />
			<TreeSelect
				{...omit(props, ['onChange', 'treeData', 'value', 'showFile'])}
				value={showName}
				onChange={onTreeChange}
				onSelect={updateShowName}
				treeIcon={showFile}
			>
				{generateTreeNodes()}
			</TreeSelect>
		</>
	);
}
