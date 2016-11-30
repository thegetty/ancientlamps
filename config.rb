# require "extensions/search"
require "extensions/catalogue/catalogue"

# activate :search
activate :catalogue

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
configure :development do
  activate :livereload
end

# Production Environment
# ------------------------------------------------
configure :build do
  activate :relative_assets
  ignore { |path| path =~ /assets\/javascripts\/(.*)\.js$/ && $1 != 'application' }
  # activate :minify_javascript

  # activate :minify_html
  # activate :minify_css
  # activate :minify_javascript
  # activate :gzip
end

# Deploy settings
# ------------------------------------------------
activate :deploy do |deploy|
  deploy.build_before = true
  deploy.deploy_method = :git
end

activate :external_pipeline,
  name: :webpack,
  command: build? ?
    './node_modules/webpack/bin/webpack.js --bail -p' :
    './node_modules/webpack/bin/webpack.js --watch -d --progress --color',
  source: ".tmp/dist",
  latency: 1

configure :server do
  ready do
    files.on_change :source do |changed|
      changed_js = changed.select do |f|
        f[:full_path].extname === '.js' && !f[:full_path].to_s.include?('.tmp')
      end

      if changed_js.length > 0
        puts "== Linting Javascript"
        puts `./node_modules/eslint/bin/eslint.js #{changed_js.map { |js| js[:full_path].relative_path_from(app.root_path).to_s }.join(' ')}`
      end
    end
  end
end
