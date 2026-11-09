import { Fragment, isValidElement } from 'react';

export function isFragment(object: unknown): boolean {
	return isValidElement(object) && object.type === Fragment;
}

export default { isFragment };
