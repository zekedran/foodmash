Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false
  # config.web_console.whitelisted_ips = '192.168.1.0/24'

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = true

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Compress JavaScripts and CSS.
  config.assets.compress = false
  # config.assets.js_compressor = :uglifier

  ENV['BUCKET_NAME'] = 'foodmash-india'
  ENV['ACCESS_KEY_ID'] = 'AKIAIHVZIHUKB5JAAZJA'
  ENV['SECRET_ACCESS_KEY'] = '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'

  # config.action_mailer.default_url_options = {host: 'localhost:3000'}
  config.action_mailer.delivery_method = :mailgun
  config.action_mailer.mailgun_settings = {
    api_key: 'key-94f4c01f83062ed201fee0c4463bacf5',
    domain: 'foodmash.in'
  } 

  ENV['key'] = 'gtKFFx'
  ENV['salt'] = 'eCwWELxi'

  ENV['mailgun_api_key'] = 'key-94f4c01f83062ed201fee0c4463bacf5'

  ENV['twilio-account-sid'] = 'ACa3f2ecc971d8239bdff382d6dfbcccdc'
  ENV['twilio-auth-token'] = '075fed6cc817260e1dcb16d5ba3e615b'


  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Asset digests allow you to set far-future HTTP expiration dates on all assets,
  # yet still be able to expire them through the digest params.
  config.assets.digest = true

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true
end
