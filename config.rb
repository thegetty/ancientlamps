# require "extensions/search"
# require "extensions/catalogue"

# activate :search
# activate :catalogue

# Gulp Pipeline
# ------------------------------------------------
# All files except JS and CSS are still handled by
# Middleman. Make sure to ignore anything else
# that will be handled by Gulp instead.
ignore "assets/stylesheets"
ignore "assets/javascripts"
activate :external_pipeline,
         name: :gulp,
         command: build? ? 'npm run build' : 'npm run dev',
         source: '.tmp'

# General settings
# ------------------------------------------------
activate :directory_indexes
set :relative_links, true
set :css_dir, "assets/stylesheets"
set :js_dir, "assets/javascripts"
set :images_dir, "assets/images"
set :fonts_dir, "assets/fonts"
set :layout, "layouts/application"
set :markdown, :parse_block_html => true

page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

# Development Environment
# ------------------------------------------------
# configure :development do
#   activate :livereload
# end

# Production Environment
# ------------------------------------------------
configure :build do
  activate :relative_assets
  activate :minify_html
  activate :minify_css
  activate :minify_javascript
  activate :gzip
end

# Deploy settings
# ------------------------------------------------
activate :deploy do |deploy|
  deploy.build_before = true
  deploy.deploy_method = :git
end
