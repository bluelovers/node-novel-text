/**
 * Created by user on 2017/12/5/005.
 */

import * as StrUtil from 'str-util';
import chkBlankLine from 'blank-line';
import tiebaHarmony from 'tieba-harmony';

export const SP_REGEXP = tiebaHarmony.SP_REGEXP;
export const SP_KEY = tiebaHarmony.SP_KEY;

export interface IOptions
{
	words?: boolean
	pad_eng?: boolean
}

export interface IWordsOutput
{
	_source?: any,

	s?: RegExp,
	r?: string | IRegExpCallback,

	flags?: string,
}

export interface IRegExpCallback
{
	($0: string, $1?: string, $2?: string, $3?: string, ...argv): string;
}

export interface IToStrOptions
{
	LF?: string,
	allow_nbsp?: boolean,
	allow_bom?: boolean,
}

export interface ITextLayoutOptions extends IToStrOptions
{
	allow_lf2?: boolean,
}

export class enspace
{
	public _cache_ = {
		replace: [],
		words: new Map(),
	};
	public _data_ = {
		m0: /([^a-z0-9\-\.\s])?([a-z0-9\-\.]+(?:[a-z0-9\-\.\s]+[a-z0-9\-\.]+)?)([^a-z0-9\-\.\s])?/uig,
		r1: /[「」①→\'\":\-\+（）╮（╯＿╰）╭\(\)\[\]■【】《》~～“”‘’:：：，*＊@。ω・、。`　─一\d『』◆~、？！\?\!×\.\<\>=…・]/i,

		rtrim: /[ \t\uFEFF\xA0　]+$/,

		words: [
			/*
			{
				s: '（·）',
				r: '',
			},
			*/
			{
				s: /\.{3}/g,
				r: '…',
			},
			{
				s: /…\.{1,2}/g,
				r: '……',
			},

			/*
			{
				s: /(第)(?:[\_\t\uFEFF\xA0　]+)(\d+)(?:[\_\t\uFEFF\xA0　]+)(话|頁|夜|章)/g,
				r: '$1 $2 $3',
			},
			{
				s: /(第)(?:[\_\t\uFEFF\xA0　]+)?(\d+)(?:[\_\t\uFEFF\xA0　]+)(话|頁|夜|章)/g,
				r: '$1 $2 $3',
			},
			{
				s: /(第)(?:[\_\t\uFEFF\xA0　]+)(\d+)(?:[\_\t\uFEFF\xA0　]+)?(话|頁|夜|章)/g,
				r: '$1 $2 $3',
			},
			*/
			{
				s: /(话|日|章)[\_\t\uFEFF\xA0]+/ig,
				r: '$1 ',
			},
			{
				s: '！　',
				r: '！',

				no_regex: false,
			},
			/*
			{
				r: /([「」【】《》『』（）])/ig,
				s: '$1',
			},
			*/
			/*
			{
				s: /(\?\?)[ \t　]+(\?\?)/ig,
				r: '$1$2',
			},
			{
				s: /「([^「『』」]+)?『([^\n』]+)」([^「『』」]+)?』/,
				r: '「$1『$2』$3」',
			},
			{
				s: /『([^「『』」]+)?「([^\n」]+)』([^「『』」]+)?」/,
				r: '『$1「$2」$3』',
			},
			{
				s: /情\s*se\s*小说/ig,
				r: '情色小说',
			},
			*/
			{
				s: /^([^「『“”』」]+)?(“)([^「『“”』」]+)[』」]([^”]+)?$/m,
				r: '$1$2$3”$4',
			},
			{
				s: /，——/g,
				r: '——',
			},
			{
				s: /(?:話|话)/ug,
				r: '話',
			},
			[/　[ \t]+（/g, '　（'],

			//['製止', '制止'],

			//['預防性雞鴨', '預防性羈押'],

			//['查水[錶表]', '查水錶'],

		] as IWordsOutput[],

	};
	public options = {};

	public _words_r1 = SP_REGEXP;

	constructor(options?)
	{
		let _self = this;

		let r = this._words_r1;

		let arr = []
			.concat(options && options.words_block ? options.words_block : null)
		;

		this._data_.words = this._words1(arr, this._data_.words);
		this._data_.words = this._words2(this._data_.words);
	}

	static create(...argv)
	{
		return new this(...argv);
	}

	_words1(arr: string[], words = []): IWordsOutput[]
	{
		let r = this._words_r1;

		arr
			.filter(function (el, index, arr)
			{
				return el && (index == arr.indexOf(el));
			})
			.forEach(function (value)
			{
				let a = value.split('@');

				/*
				_self._data_.words.push({
					s: new RegExp(`(${a[0]})${r}(${a[1]})`, 'g'),
					r: '$1$2',
				});
				*/

				let s = a.join(`)${r}(`);

				words.push({
					s: new RegExp(`(${s})`, 'g'),
					r: a.map(function (value, index, array)
					{
						return '$' + (index + 1);
					}).join(''),
				});
			})
		;

		return words;
	}

	_words2(words): IWordsOutput[]
	{
		let r = this._words_r1;

		return words.map(function (value, index, array)
		{
			// @ts-ignore
			if (value.no_regex)
			{
				return value;
			}

			if (Array.isArray(value) && (value.length == 2 || value.length == 3))
			{
				value = {
					_source: value,

					s: value[0],
					r: value[1],

					flags: value[2],
				};
			}

			if (typeof value.s == 'string' && (value.s as string).match(new RegExp(`${SP_KEY}(.+)$`)))
			{
				// @ts-ignore
				if (!value._source) value._source = value.s;

				let a = value.s.split(SP_KEY);
				let s = a.join(`)${r}(`);

				value.s = new RegExp(`(${s})`, value.flags ? value.flags : 'g');

				//console.log(value.s);

				if (value.r === null)
				{
					value.r = a.map(function (value, index, array)
					{
						return '$' + (index + 1);
					}).join('');
				}
			}
			else if (typeof value.s == 'string')
			{
				// @ts-ignore
				if (!value._source) value._source = value.s;

				value.s = new RegExp(value.s, value.flags ? value.flags : 'g');
			}
			else if (Array.isArray(value) && value.length == 1 && typeof value[0] == 'function')
			{
				value = value[0];
			}
			else if (typeof value.fn == 'function')
			{
				value = value.fn;
			}

			return value;
		});
	}

	replace(text, options: IOptions = {}): string
	{
		if (!text || !/[^\s]/.test(text))
		{
			return text;
		}

		let _self = this;

		let _ret = this.toStr(text)
			.replace(_self._data_.rtrim, '')
		;

		if (options.pad_eng)
		{
			_ret = this.paddingEng(_ret);
		}

		if (options.words)
		{
			_ret = this.replace_words(_ret, _self._data_.words, _self._cache_.words).value;
		}

		return _ret;
	}

	replace_words(_ret, words: IWordsOutput[], _cache_words?)
	{
		if (!_cache_words)
		{
			_cache_words = new Map();
		}

		for (let i in words)
		{
			let _new;

			if (typeof words[i] == 'function')
			{
				_new = (words[i] as Function)(_ret, _cache_words);
			}
			else
			{
				let _r = words[i].s;

				_new = _ret.replace(_r, words[i].r);
			}

			if (_new != _ret)
			{
				let myMap = [];

				if (_cache_words.has(words[i]))
				{
					myMap = _cache_words.get(words[i]);
				}

				myMap.push({
					old: _ret,
					new: _new,
				});

				_cache_words.set(words[i], myMap);

				_ret = _new;
			}

			if (!/[^\s]/.test(_ret))
			{
				break;
			}
		}

		return {
			value: _ret as string,
			cache: _cache_words,
		};
	}

	paddingEng(text: string)
	{
		let _self = this;

		return this.toStr(text)
			.replace(_self._data_.m0, function (...argv)
			{
				if (argv[2])
				{
					let old = argv[2];

					if (argv[2].length > 1 && argv[1] && !_self._data_.r1.test(argv[1]))
					{
						argv[2] = ' ' + argv[2];
					}

					if (argv[3] && !_self._data_.r1.test(argv[3]))
					{
						argv[2] = argv[2] + ' ';
					}

					if (old != argv[2])
					{
						_self._cache_.replace.push({
							old: old,
							new: argv[2],

							data: argv,
						});
					}
					else
					{
						//console.debug([old, argv[2]], argv);
					}

					return (argv[1] || '') + argv[2].replace(/( ){2,}/g, '$1') + (argv[3] || '');
				}

				return argv[0];
			})
			;
	}

	clearLF(text: string)
	{
		return this.trim(text)
			.replace(/\n{4,}/g, '\n\n')
			.replace(/\n{3,}/g, '\n\n')
			;
	}

	trim(text: Buffer, options?): string
	trim(text: string, options?): string
	trim(text: number, options?): string
	trim(text, options?): string
	{
		let ret = this.toStr(text, options)
			.replace(/[ \t　\xA0\u3000]+\n/g, '\n')
			.replace(/^\n+|[\s　\xA0\u3000]+$/g, '')
			;

		if (typeof options == 'boolean')
		{
			options = {
				trim: !!options,
			}
		}
		else if (typeof options == 'string')
		{
			options = {
				trim: options,
			}
		}

		if (options)
		{
			if (typeof options.trim == 'string')
			{
				ret = StrUtil.trim(ret, '　' + options.trim);
			}
			else if (options.trim)
			{
				ret = StrUtil.trim(ret, '　');
			}
		}

		return ret;
	}

	toStr(str: Buffer | string | number | any, options?: IToStrOptions): string
	toStr(str: Buffer | string | number | any, options?: string): string
	toStr(str, options?: string | IToStrOptions): string
	{
		if (typeof options == 'string')
		{
			options = {
				LF: options,
			};
		}

		options = Object.assign({
			LF: "\n",
			allow_nbsp: false,
			allow_bom: false,
		}, options);

		let ret = str
			.toString()
			.replace(/\r\n|\r(?!\n)|\n/g, options.LF || "\n")
		;

		if (!options.allow_bom)
		{
			ret = ret.replace(/\uFEFF/g, '');
		}

		if (!options.allow_nbsp)
		{
			ret = ret.replace(/[  \xA0]/g, ' ');
		}

		return ret;
	}

	/**
	 * 通用型段落調整
	 *
	 * @returns {string}
	 */
	textlayout(html, options: ITextLayoutOptions = {}): string
	{
		html = this.trim(html, options);

		html = html
			.replace(/\r\n|\r(?!\n)/g, "\n")
			.replace(/[ 　\t]+\n/g, "\n")
			.replace(/[\s　]+$/g, '')
			.replace(/^[\n \t]+/g, '')
			.replace(/\n{4,}/g, "\n\n\n\n")
		;

		if (!html.match(/[^\n]\n[^\n]/g))
		{
			let [min, mid, max] = chkBlankLine(html.toString());

			if (min > 2)
			{
				options.allow_lf2 = false;
			}

			if (max >= 3)
			{
				if (min > 2)
				{
					let r = new RegExp(`\\n{${min - 1}}(\\n*)`, 'g');

					html = html
						//.replace(/\n{2}(\n*)/g, '$1')
						.replace(r, '$1')
					;
				}

				html = html
					.replace(/\n{3,}/g, "\n\n\n")
					//.replace(/\n{2}/g, "\n")
				;
			}

			if (!options.allow_lf2)
			{
				html = html
					.replace(/\n\n/g, "\n")
				;
			}
		}

		html = html
			// for ts
			.toString()
			.replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")

			.replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n([^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")
			.replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")

			.replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:　+)?[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")

			.replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")

			/**
			 * https://tieba.baidu.com/p/5400503864
			 *
			 * 「第三试炼也，多亏了妮露而通过了吗……」
			 『心神守护的白羽毛』，这个从妮露那里收到的护身符，确实地守护了我的心。

			 */
			.replace(/([「」【】《》“”『』（）―](?:[！？?!。]*)?)\n((?:[「」“”【】《》（）『』])(?:[^\n]+)([^「」【】《》“”『』（）―](?:[！？?!。]*)?)\n)/ug, "$1\n$2\n")

			/**
			 * 住手，住手，我就是我。不是其他的任何人。
			 　表示出要必死地进行抵抗的意志，但是侵入脑内的这个『什么东西』，并不能被阻止。不能被，阻止……
			 */
			.replace(/(\n(?:[^　\n][^\n]+))\n([　])/g, '$1\n\n$2')

			/**
			 * 这样一直在这高兴着

			 。
			 */
			//.replace(/([^\n])(\n+)((?:[吧呢]*)?[。！？，、])\n/ug, "$1$3$2")

			.replace(/([^\n])(\n+)(fin|\<完\>)(\n|$)/ig, "$1$2\n$3$4")
		;

		html = html
			.replace(/^\n+|[\s　]+$/g, '')
			.replace(/(\n){4,}/g, "\n\n\n\n")
			.replace(/(\n){3}/g, "\n\n")
		;

		return html;
	}

}

import * as NovelText from './text';

export default NovelText;
