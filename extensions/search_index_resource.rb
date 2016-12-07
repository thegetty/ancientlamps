require "sanitize"

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

      def render(opts = {}, locs = {})
        page_index = build_page_index
        page_index.to_json
      end

      def build_page_index
        index = []
        @app.data.catalogue.each_with_index do |resource, id|
          item = {
            id: id,
            cat: resource.cat_no.to_s,
            inv: resource.inv_no,
            dor_id: resource.dor_id,
            place: resource.place,
            provenance: resource.provenance,
            description: resource.description,
            parallels: resource.parallels,
            discussion: resource.discussion,
            discus: resource.discus_iconography
          }
          index.push(item)
        end

        index
      end

      # TODO: lookup table method here
      # def lookup_entry(cat)
        # @app.data.catalogue.find { |entry| entry.cat == cat }
      # end
    end
  end
end
