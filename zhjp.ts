/**
 * Created by user on 2018/1/25/025.
 */

import * as StrUtil from 'str-util';

export function filename(name: string, options = {}): string
{
	return jp(name, options)
		.replace(/·/g, '・')
		;
}

export function word(name: string, options = {}): string
{
	return jp(name, options);
}

export function jp(txt: string, options = {}): string
{
	return zh(StrUtil.zh2jp(txt, {
		// @ts-ignore
		skip: '龙竜龍制征里像拜冰' + (options.skip || ''),
		}))
		.replace(/诅/g, '詛')
		.replace(/复仇/g, '復仇')
		.replace(/戦斗/g, '戦闘')
		.replace(/^プロローグ/, '序')
		.replace(/^エピローグ/, '終章')
		;
}

export function zh(txt: string, options = {}): string
{
	return txt
		.replace(/与/g, '與')
		.replace(/[亜亚亞]/g, '亞')
		.replace(/価/, '價')
		.replace(/[觉覚覺]/g, '覺')
		.replace(/亏/g, '虧')
		.replace(/[·‧・···•]/g, '・')
		//.replace(/当/g, '當')
		;
}

import * as self from './zhjp';
export default self;
