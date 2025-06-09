<?php

$classes = [ 'notice' ];

switch ($notice['type']) {
    case 'success':
        $classes[] = 'notice-success';
        break;
    case 'error':
        $classes[] = 'notice-error';
        break;
    case 'warning':
        $classes[] = 'notice-warning';
        break;
    case 'info':
    default:
        $classes[] = 'notice-info';
        break;
}

if ($notice['dismissible']) {
    $classes[] = 'is-dismissible';
}

$class_string = implode(' ', $classes);
?>
<div class="<?php echo esc_attr($class_string); ?>" data-notice-id="<?php echo esc_attr($notice['id']); ?>">
	<?php if (! empty($notice['title'])) : ?>
		<h3><?php echo esc_html($notice['title']); ?></h3>
	<?php endif; ?>

	<p><?php echo wp_kses_post($notice['message']); ?></p>
	<?php if (! empty($notice['actions'])) : ?>
		<p>
			<?php foreach ($notice['actions'] as $action) : ?>
				<a href="<?php echo esc_url($action['url']); ?>" class="button <?php echo esc_attr($action['class'] ?? 'button-secondary'); ?>">
					<?php echo esc_html($action['label']); ?>
				</a>
			<?php endforeach; ?>
		</p>
	<?php endif; ?>
</div>
<script>
jQuery(document).ready(function($) {
	$('.notice.is-dismissible').on('click', '.notice-dismiss', function(e) {
		e.preventDefault();

		var $notice = $(this).closest('.notice');
		var noticeId = $notice.data('notice-id');

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'blockera_dismiss_notice',
				notice_id: noticeId,
				nonce: '<?php echo wp_create_nonce('blockera_notice_nonce'); ?>'
			},
			success: function(response) {
				if (response.success) {
					$notice.fadeOut();
				}
			}
		});
	});
});
</script>
