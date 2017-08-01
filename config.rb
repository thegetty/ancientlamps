require 'extensions/search'
require 'extensions/book'

activate :search
activate :pry

activate :book do |b|
  b.additional_epub_images = [
    "assets/images/fig_01.jpg",
    "assets/images/fig_02.jpg",
    "assets/images/fig_03.jpg",
    "assets/images/fig_04.jpg",
    "assets/images/cc-by.png",
    "assets/images/cover.jpg",
    "assets/images/getty_logo.png"
  ]
end

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
  set :baseurl, ""
end

# Production Environment
# ------------------------------------------------
configure :build do
  set :baseurl, "/ancient-lamps"
  activate :relative_assets
  ignore { |path| path =~ /assets\/javascripts\/(.*)\.js$/ && $1 != 'application' }

  activate :minify_html
  activate :minify_css
  # activate :gzip
end

configure :pdf do
  page "*", directory_index: false
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
