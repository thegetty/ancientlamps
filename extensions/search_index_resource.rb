require 'sanitize'

module Middleman
  module Sitemap
    class SearchIndexResource < ::Middleman::Sitemap::Resource
      def initialize(store, path)
        super(store, path)
        @index = []
      end

      def template?
        false
      end

      def get_source_file
        path
      end

      def render(_opts = {}, _locs = {})
        build_page_index
        build_catalogue_index
        @index.to_json
      end

      def build_page_index
        pages = @app.sitemap.resources.find_all { |p| p.data.sort_order }
        pages.each_with_index do |resource, id|
          next if resource.data['index'] == false
          item = {
            id: id,
            title: resource.data.title || resource.data.hierarchy.last.values.join,
            url: @app.config.baseurl + resource.url,
            cat: resource.data.cat || nil,
            content: Sanitize.fragment(resource.render(layout: false))
          }

          @index.push(item)
        end
      end

      def lookup_entry(cat)
        @app.data.catalogue.find { |entry| entry.cat == cat }
      end

      def lookup_page_path_for_entry(cat)
        page = @app.data.lookup_table.find do |p|
          Array(p.cat_no).flatten.include? cat
        end

        "/catalogue/#{page.path}"
      end

      def build_catalogue_index
        starting_id = @index.size
        @app.data.catalogue.each_with_index do |entry, id|
          next if entry.cat_no == "TBD"
          item = {
            id: starting_id + id,
            title: "Cat. #{entry.cat_no}",
            url: @app.config.baseurl + lookup_page_path_for_entry(entry.cat_no) + "##{entry.cat_no}",
            content: [
              entry.date,
              entry.description,
              entry.discus_iconography,
              entry.parallels,
              entry.place,
              entry.discussion
            ].join(" ")
          }

          @index.push(item)
        end
      end
    end
  end
end
