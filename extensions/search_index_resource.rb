require 'sanitize'

module Middleman
  module Sitemap
    class SearchIndexResource < ::Middleman::Sitemap::Resource
      def initialize(store, path)
        super(store, path)
      end

      def template?
        false
      end

      def get_source_file
        path
      end

      def render(_opts = {}, _locs = {})
        page_index = build_page_index
        page_index.to_json
      end

      def build_page_index
        index = []
        pages = @app.sitemap.resources.find_all { |p| p.data.sort_order }
        pages.each_with_index do |resource, id|
          next if resource.data['index'] == false

          inv = if resource.data.cat
                  page_accession_numbers(resource.data.cat)
                end

          item = {
            id: id,
            title: resource.data.title || resource.data.hierarchy.last.values.join,
            url: @app.config.baseurl + resource.url,
            cat: resource.data.cat || nil,
            inv: inv,
            content: Sanitize.fragment(resource.render(layout: false))
          }

          index.push(item)
        end
        index
      end

      def lookup_entry(cat)
        @app.data.catalogue.find { |entry| entry.cat_no == cat }
      end

      def page_accession_numbers(cat_entries)
        cat_entries = Array(cat_entries) unless cat_entries.respond_to? :map
        cat_entries.map do |e|
          entry_data = lookup_entry(e)
          entry_data.inv_no unless entry_data.nil?
        end
      end
    end
  end
end
