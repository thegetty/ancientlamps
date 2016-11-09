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


# Sort Catalogue Contents
# returns an array of resource objects ordered by sort_order attribute
def sort_catalogue_contents
  contents = sitemap.resources.find_all { |p| p.data.sort_order }
  contents.sort_by { |p| p.data.sort_order }
end

# Get Catalogue Sections
# Returns 3 arrays of resource objects (frontmatter, catalogue, backmatter)
def catalogue_sections
  contents    = sort_catalogue_contents
  frontmatter = contents.find_all { |p| p.data.sort_order <= 10 }
  backmatter  = contents.find_all { |p| p.data.sort_order > 100 }
  catalogue   = contents.find_all do |p|
    p.data.sort_order > 10 && p.data.sort_order <= 100
  end
  [frontmatter, catalogue, backmatter]
end

# --------------------------------------------------------------------------
# Previous Chapter Path
# Does not expect an argument (pulls data from current_page)
# Returns the path of the previous chapter or false if prev chapter does not
# exist. This method also checks if the chapter is the first in a given
# section and pulls the last chapter from the previous section if so.
def prev_chapter_path
  return false unless current_page.data.sort_order
  curr = current_page.data.sort_order
  frontmatter, catalogue, backmatter = catalogue_sections
  case curr
  when frontmatter.first.data.sort_order
    prev_chap = false
  when catalogue.first.data.sort_order
    prev_chap = frontmatter.last
  when backmatter.first.data.sort_order
    prev_chap = catalogue.last
  else
    prev_chap = sitemap.resources.find { |p| p.data.sort_order == curr - 1 }
  end
  prev_chap ? prev_chap : false
end

# Next Chapter Path
# Does not expect an argument (pulls data from current_page)
# Returns the path of the next chapter or false if next chapter does not
# exist. This method also checks if the chapter is the last in a given
# section and pulls the first chapter from the next section if so.
def next_chapter_path
  return false unless current_page.data.sort_order
  curr = current_page.data.sort_order
  frontmatter, catalogue, backmatter = catalogue_sections
  case curr
  when frontmatter.last.data.sort_order
    next_chap = catalogue.first
  when catalogue.last.data.sort_order
    next_chap = backmatter.first
  when backmatter.last.data.sort_order
    next_chap = false
  else
    next_chap = sitemap.resources.find { |p| p.data.sort_order == curr + 1 }
  end
  next_chap ? next_chap : false
end
