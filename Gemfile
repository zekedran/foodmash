source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.0'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.1.0'
# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
# gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc
# for user authentication 
gem 'devise'
# for having roles attached to users
gem 'rolify'
# for having role based authorization(along with rolify)
gem 'cancan'
# for change of states of resources
gem 'aasm'
# a lightweight alternative to Webrick server
gem 'passenger'
# used for pretty printing of console objects
gem 'awesome_print'
# bootstrap css in sass
gem 'bootstrap-sass-rails'
# angular dependencies built into bundler
gem 'angularjs-rails'
# connecting angular backend rails objects
gem 'angularjs-rails-resource'
# version manager for front end resources
# gem "bower-rails"
# twillio client for sending sms
gem 'twilio-ruby', '>= 4.2.1'
# direct upload to S3 bucket 
gem 'aws-sdk', '~> 2'

gem "font-awesome-rails"

gem 'delayed_job_active_record'

gem 'daemons'

gem 'mailgun_rails'

gem 'rack-cors', :require => 'rack/cors'

gem 'tzinfo-data'
#for payment gateway integration

gem 'material_icons'

group :production do
  gem 'execjs'
  gem 'pg'
  gem 'rails_12factor'
  gem 'prerender_rails'
end

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

group :development, :test do
	# Use sqlite3 as the database for Active Record
	gem 'sqlite3'
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'

  gem 'thin'

  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
end

