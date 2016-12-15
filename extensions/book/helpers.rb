# frozen_string_literal: true
module Book
  module Helpers
    # Determine if there is a chapter before the current page
    # @return Middleman::Sitemap::Resource of the previous page
    def prev_chapter_path
      return false unless current_page.respond_to?(:prev_chapter)
      current_page.prev_chapter
    end

    # Determine if there is a chapter after the current page
    # @return Middleman::Sitemap::Resource of the next page
    def next_chapter_path
      return false unless current_page.respond_to?(:next_chapter)
      current_page.next_chapter
    end

    def byline
      authors = data.book.creators
      authors.map { |a| "#{a.first_name} #{a.last_name}" }.join(' and ')
    end

    def page_title_section
      "#{title.main} | #{byline}"
    end

    def page_title_catalogue
      page = current_page.data
      if page.cat.respond_to? :each
        "Cats. #{page.cat.first}-#{page.cat.last} | #{data.book.title.short}"
      else
        "Cat. #{page.cat} | #{data.book.title.short}"
      end
    end

    def page_title
      page = current_page.data

      if page.cat
        page_title_catalogue
      elsif page.sort_order == 0
        "#{data.book.title.main} | #{byline}"
      else
        "#{page.title} | #{data.book.title.short}"
      end
    end

    def og_image_path
      "http://www.getty.edu#{config.baseurl}/assets/images/og_cover.jpg"
    end

    def catalogue_lookup(cat_num)
      data.catalogue.find { |c| c[:cat_no] == cat_num }
    end

    # --------------------------------------------------------------------------
    # Book info methods
    # Used to build up the complex strings used in the citation partial
    def book_info_chicago
      book = data.book
      path = current_path.gsub('index.html', '')
      %(
        In <em>#{book.title.main}</em>,
        by #{byline}.
        #{book.publisher_location}:
        #{book.publisher},
        #{book.pub_date.year}.
        <span class="force-wrap">#{permalink}/#{path}</span>.
      )
    end

    def book_info_mla
      book = data.book
      path = current_path.gsub('index.html', '')
      %(
        <em>#{book.title.main}</em>. By #{byline}.
        #{book.publisher_location}:
        #{book.publisher_short}, #{book.pub_date.year}.
        <span class="cite-current-date">DD Mon. YYYY</span>
        <<span class="force-wrap">#{permalink}/#{path}</span>>.
      )
    end

    # --------------------------------------------------------------------------
    # Citation author method
    # Returns correct author info for citation partial
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

    # --------------------------------------------------------------------------
    # Default author
    # Return default author name in citation format (last, first)
    def default_author
      book = data.book
      if book.creators.size > 1
        %(#{book.creators[0].last_name}, #{book.creators[0].first_name},
        and #{book.creators[1].first_name} #{book.creators[1].last_name})
      else
        "#{book.creators.first.last_name}, #{book.creators.first.first_name}"
      end
    end

    def permalink
      data.book.editions.find { |edition| edition.name == 'Online' }.link
    end

    # def catalogue_link(text, url)
    #   if environment? :print
    #     "<a href='../../build/#{url}'>#{text}</a>"
    #   elsif environment? :epub
    #   else
    #     link_to text, url
    #   end
    # end

    # --------------------------------------------------------------------------
    # Collection link method
    # Expects a cat number (int)
    # Outputs a HAML tag with link to the Getty collection page for the object
    def collection_link(cat)
      url    = 'http://www.getty.edu/art/collection/objects/'
      obj_id = lookup_entry(cat).dor_id
      return false if obj_id.nil?
      haml_tag :a,
               :class => 'collection-link',
               :target => 'blank',
               :title  => "View this item on the Getty's Collection Pages.",
               :href   => "#{url}#{obj_id}" do
                 haml_tag :i, :class => 'ion-link'
               end
    end

    # --------------------------------------------------------------------------
    # Location Link method
    # Expects two arguments: first, the desired link text
    # Second: a url pattern like so: "/catalogue/italy.html#loc_1524"
    # Where /catalogue/italy.html is the relevant map page
    # and #loc_xxxx is the location id of the point to appear on the map
    # as referenced in the geojson file
    def location_link(text, destination)
      html = content_tag :sup, :class => 'location-link' do
        tag :i, :class => 'ion-ios-location-outline'
        link_to destination.to_s, :title => 'View this location on the map' do
          tag :i, :class => 'ion-ios-location-outline'
        end
      end
      concat_safe_content("#{text}#{html}")
    end
  end
end
