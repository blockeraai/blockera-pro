/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback, useMemo, memo } from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { Flex } from '@blockera/controls';
import { isEquals, pascalCase } from '@blockera/utils';
import { classNames } from '@blockera/classnames';

/**
 * Internal dependencies
 */
import {
	PresetGroup,
	getNewIndexFromPresets,
	type PresetGroupPropsType,
	type PresetFieldsPropsResolver,
} from '../components';
import { useGlobalSetting } from '../../context/hooks';
import { type VariableType } from '../components/types';
import { BorderPresetOpener } from './border-preset-opener';
import {
	BorderPresetSize,
	type BorderBoxDefaultPresetValue,
} from './border-preset-size';
import { NavItemBackButton } from '../../../../navigation/nav-item-back-button';
import ConfirmResetFontSizesDialog from '../font-sizes/confirm-reset-font-sizes-dialog';
import {
	sanitizeBorderBoxPresets,
	getDefaultBoxBorderValue,
	type BorderBoxPreset,
} from './utils';

type BorderBoxPresetGroup = {
	defaultPresetValue: BorderBoxDefaultPresetValue;
};

type BorderBoxPresetGroupProps = PresetGroupPropsType & BorderBoxPresetGroup;

const borderPresetFieldsPropsResolver: PresetFieldsPropsResolver = (
	item,
	itemId,
	origin
) => ({
	origin,
	borderPreset: item,
	presetId: itemId,
});

const BORDER_PRESET_ADD_MODAL_CONFIG = {
	headerTitle: __('Add Border Preset', 'blockera'),
	description: __(
		'Name your new border preset. The ID will be generated from the name and used in your styles.',
		'blockera'
	),
	duplicateSlugMessage: __(
		'This ID is already used by another border preset.',
		'blockera'
	),
	controlNamePrefix: 'add-border-preset',
};

function BorderBoxPresetGroupComponent(props: BorderBoxPresetGroupProps) {
	return <PresetGroup {...props} />;
}

function BorderPresetGroupComponent({
	sizes,
	origin,
	handleUpdateSizes,
	handleResetPresets,
}: {
	label: string;
	origin: string;
	sizes: BorderBoxPreset[];
	handleUpdateSizes?: (newValue: Object) => void;
	handleResetPresets?: () => void;
}) {
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

	const toggleResetDialog = () => setIsResetDialogOpen(!isResetDialogOpen);

	const resetDialogText =
		origin === 'custom'
			? __(
					'Are you sure you want to remove all custom border presets?',
					'blockera'
				)
			: __(
					'Are you sure you want to reset all border presets to their default values?',
					'blockera'
				);

	const index = useMemo(
		() => getNewIndexFromPresets(sizes, 'custom-'),
		[sizes]
	);

	const defaultPresetValue = useMemo((): BorderBoxDefaultPresetValue &
		VariableType => {
		return {
			border: getDefaultBoxBorderValue(),
			slug: `border-${index}`,
			deletable: !!('custom' === origin),
			cloneable: !!('custom' === origin),
			visibilitySupport: !!('custom' === origin),
			/* translators: %d: border preset index */
			name: sprintf(__('Border %d', 'blockera'), index) as string,
		};
	}, [origin, index]);

	const controlName = `border-preset-presets-${origin}`;

	const handleChange = useCallback(
		(newValue: Object) => {
			if (!handleUpdateSizes) {
				return;
			}
			handleUpdateSizes(newValue);
		},
		[handleUpdateSizes]
	);

	return (
		<>
			{handleResetPresets && isResetDialogOpen && (
				<ConfirmResetFontSizesDialog
					text={resetDialogText}
					confirmButtonText={
						origin === 'custom'
							? __('Remove', 'blockera')
							: __('Reset', 'blockera')
					}
					isOpen={isResetDialogOpen}
					toggleOpen={toggleResetDialog}
					onConfirm={handleResetPresets}
				/>
			)}
			<BorderBoxPresetGroupComponent
				repeaterItemHeader={BorderPresetOpener}
				onChange={handleChange}
				controlName={controlName}
				defaultPresetValue={defaultPresetValue}
				origin={origin}
				variables={sizes}
				PresetFields={BorderPresetSize}
				title={__('Border', 'blockera')}
				label={sprintf(
					/* translators: %s: Origin name (Theme, Default, or Custom) */
					__('%s Variables', 'blockera'),
					pascalCase(origin)
				)}
				addVariableModalConfig={BORDER_PRESET_ADD_MODAL_CONFIG}
				presetFieldsPropsResolver={borderPresetFieldsPropsResolver}
			/>
		</>
	);
}

const BorderPresetGroup = memo(BorderPresetGroupComponent);

function BordersPresetContent() {
	const [rawThemePresets, setThemePresets] = useGlobalSetting(
		'custom.blockera.borderPresets.theme'
	);

	const [baseThemePresets] = useGlobalSetting(
		'custom.blockera.borderPresets.theme',
		'',
		'base'
	);
	const [rawDefaultPresets, setDefaultPresets] = useGlobalSetting(
		'custom.blockera.borderPresets.default'
	);

	const [baseDefaultPresets] = useGlobalSetting(
		'custom.blockera.borderPresets.default',
		'',
		'base'
	);

	const [rawCustomPresets = [], setCustomPresets] = useGlobalSetting(
		'custom.blockera.borderPresets.custom'
	);

	const themePresets = useMemo(
		() => sanitizeBorderBoxPresets(rawThemePresets),
		[rawThemePresets]
	);
	const defaultPresets = useMemo(
		() => sanitizeBorderBoxPresets(rawDefaultPresets),
		[rawDefaultPresets]
	);
	const customPresets = useMemo(
		() => sanitizeBorderBoxPresets(rawCustomPresets),
		[rawCustomPresets]
	);

	const convertRepeaterValueToArray = useCallback(
		(newValue: Object): BorderBoxPreset[] =>
			sanitizeBorderBoxPresets(
				Object.values(
					newValue as Record<
						string,
						BorderBoxPreset & Record<string, unknown>
					>
				).map((value) => ({
					slug: value.slug,
					name: value.name,
					border: value.border,
				}))
			),
		[]
	);

	const handleUpdateCustomSizes = useCallback(
		(newValue: Object) => {
			setCustomPresets(convertRepeaterValueToArray(newValue));
		},
		[convertRepeaterValueToArray, setCustomPresets]
	);

	const handleUpdateThemeSizes = useCallback(
		(newValue: Object) => {
			setThemePresets(convertRepeaterValueToArray(newValue));
		},
		[convertRepeaterValueToArray, setThemePresets]
	);

	const handleUpdateDefaultSizes = useCallback(
		(newValue: Object) => {
			setDefaultPresets(convertRepeaterValueToArray(newValue));
		},
		[convertRepeaterValueToArray, setDefaultPresets]
	);

	const resetThemeToBase = useCallback(() => {
		setThemePresets(sanitizeBorderBoxPresets(baseThemePresets));
	}, [setThemePresets, baseThemePresets]);

	const resetDefaultToBase = useCallback(() => {
		setDefaultPresets(sanitizeBorderBoxPresets(baseDefaultPresets));
	}, [setDefaultPresets, baseDefaultPresets]);

	const clearCustomSizes = useCallback(() => {
		setCustomPresets([]);
	}, [setCustomPresets]);

	const themeResetHandler = useMemo(() => {
		if (!themePresets?.length) {
			return undefined;
		}
		const base = sanitizeBorderBoxPresets(baseThemePresets ?? []);
		if (isEquals(themePresets, base)) {
			return undefined;
		}
		return resetThemeToBase;
	}, [themePresets, baseThemePresets, resetThemeToBase]);

	const defaultResetHandler = useMemo(() => {
		if (!defaultPresets?.length) {
			return undefined;
		}
		const base = sanitizeBorderBoxPresets(baseDefaultPresets ?? []);
		if (isEquals(defaultPresets, base)) {
			return undefined;
		}
		return resetDefaultToBase;
	}, [defaultPresets, baseDefaultPresets, resetDefaultToBase]);

	const customResetHandler = useMemo(
		() => (customPresets.length > 0 ? clearCustomSizes : undefined),
		[customPresets.length, clearCustomSizes]
	);

	return (
		<Flex direction="column" gap="32px" style={{ width: '100%' }}>
			{!!themePresets?.length && (
				<BorderPresetGroup
					origin="theme"
					label={__('Theme', 'blockera')}
					sizes={themePresets}
					handleUpdateSizes={handleUpdateThemeSizes}
					handleResetPresets={themeResetHandler}
				/>
			)}

			{!!defaultPresets?.length && (
				<BorderPresetGroup
					origin="default"
					label={__('Default', 'blockera')}
					sizes={defaultPresets}
					handleUpdateSizes={handleUpdateDefaultSizes}
					handleResetPresets={defaultResetHandler}
				/>
			)}

			<BorderPresetGroup
				origin="custom"
				label={__('Custom', 'blockera')}
				sizes={customPresets}
				handleUpdateSizes={handleUpdateCustomSizes}
				handleResetPresets={customResetHandler}
			/>
		</Flex>
	);
}

export function Borders({
	backLabel,
	closeCallback,
}: {
	backLabel: string;
	closeCallback?: () => void;
}) {
	return (
		<div
			className={classNames(
				'blockera-navigation-panel',
				'blockera-borders-presets-navigation'
			)}
		>
			<NavItemBackButton
				backLabel={backLabel}
				closeCallback={closeCallback}
			/>
			<Flex
				direction="column"
				gap="8px"
				className="blockera-borders-presets"
				style={{ width: '100%' }}
			>
				<Flex
					direction="column"
					gap="8px"
					style={{ padding: '12px 16px', width: '100%' }}
				>
					<p className="global-styles-ui-header__description">
						{__(
							'Create and edit reusable border presets for the site (settings.custom.blockera.borderPresets).',
							'blockera'
						)}
					</p>
				</Flex>

				<Flex
					direction="column"
					style={{ padding: '0 16px', width: '100%' }}
				>
					<BordersPresetContent />
				</Flex>
			</Flex>
		</div>
	);
}

export default Borders;
