// @flow

/**
 * Internal dependencies
 */
import { applyBackgroundControlHooks } from './background-control/apply';
import { applyTextShadowControlHooks } from './text-shadow-control/apply';
import { applyBoxShadowControlHooks } from './box-shadow-control/apply';

export const applyControls = () => {
	applyBackgroundControlHooks();
	applyTextShadowControlHooks();
	applyBoxShadowControlHooks();
};
