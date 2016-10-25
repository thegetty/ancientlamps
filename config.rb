require "extensions/search"
require "extensions/catalogue"

# activate :search
# activate :catalogue
activate :directory_indexes
activate :autoprefixer
activate :sprockets do |c|
  c.expose_middleman_helpers = true
end

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

configure :development do
  # activate :livereload
end

configure :build do
  activate :relative_assets
  activate :minify_html
  activate :minify_css
  activate :minify_javascript
  activate :gzip
end

activate :deploy do |deploy|
  deploy.build_before = true
  deploy.deploy_method = :git
end

helpers do
  def author_name
    author = data.book.creators.first
    %(#{data.book.creators[0].first_name} #{data.book.creators[0].last_name} and
    #{data.book.creators[1].first_name} #{data.book.creators[1].last_name})
  end

  def citation_author
    page = current_page.data
    return default_author unless page.author
    if page.author.size > 1
      %(#{page.author[0].last_name}, #{page.author[0].first_name},
          and #{page.author[1].first_name} #{page.author[1].last_name})
    else
      "#{page.author.first.last_name}, #{page.author.first.first_name}"
    end
  end

  def default_author
    book = data.book
    if book.creators.size > 1
      %(#{book.creators[0].last_name}, #{book.creators[0].first_name},
          and #{book.creators[1].first_name} #{book.creators[1].last_name})
    else
      "#{book.creators.first.last_name}, #{book.creators.first.first_name}"
    end
  end

  def book_info_chicago
    book = data.book
    path = current_path.gsub("index.html", "")
    %(
        In <em>#{book.title.main}</em>,
        by #{author_name}.
        #{book.publisher_location}:
        #{book.publisher},
        #{book.pub_date.year}.
        <span class="force-wrap">#{permalink}/#{path}</span>.
      )
  end

  def book_info_mla
    book = data.book
    path = current_path.gsub("index.html", "")
    %(
        <em>#{book.title.main}</em>. By #{author_name}.
        #{book.publisher_location}:
        #{book.publisher_short}, #{book.pub_date.year}.
        <span class="cite-current-date">DD Mon. YYYY</span>
        <<span class="force-wrap">#{permalink}/#{path}</span>>.
      )
  end

  def baseurl
    if environment? :development
      ""
    elsif environment? :production
      "/publications/romanmosaics"
    end
  end

  def og_image_path
    "http://www.getty.edu#{baseurl}/assets/images/og_cover.jpg"
  end

  def page_title
    title   = data.book.title
    authors = data.book.creators
    page    = current_page.data

    if page.cat
      if page.cat.is_a? Array
        "Cats. #{page.cat.first}-#{page.cat.last} | #{title.short}"
      else
        "Cat. #{page.cat} | #{title.short}"
      end
    elsif page.sort_order.zero?
      "#{title.main} | #{authors.first.first_name} #{authors.first.last_name}"
    else
      "#{page.title} | #{title.short}"
    end
  end

  def permalink
    data.book.editions.find { |edition| edition.name == "Online" }.link
  end
end
