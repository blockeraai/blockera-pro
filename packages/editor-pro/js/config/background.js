// @flow

const blockeraBackground: Object = {
	config: {
		meshGradientColors: {
			isActiveOnFree: true,
		},
	},
	isActiveOnStatesOnFree: true,
	isActiveOnBreakpointsOnFree: true,
	isActiveOnInnerBlocksOnFree: true,
};

export const backgroundConfig = {
	blockeraBackground,
	blockeraBackgroundClip: {
		isActiveOnStatesOnFree: true,
		isActiveOnBreakpointsOnFree: true,
		isActiveOnInnerBlocksOnFree: true,
	},
};
