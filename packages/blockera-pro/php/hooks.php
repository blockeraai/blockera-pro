<?php

add_filter( 'blockera/config/entities', 'blockera_pro_get_filtered_entities' );

if ( ! function_exists( 'blockera_pro_get_filtered_entities' ) ) {

	/**
	 * Get filtered entities.
	 *
	 * @param array $entities the previous entities.
	 *
	 * @return array the filtered entities.
	 */
	function blockera_pro_get_filtered_entities( array $entities ): array {

		$entities['blockera']['locked'] = blockera_pro_core_config( 'app.name' );

		return $entities;
	}
}
