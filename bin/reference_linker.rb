#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'

references = YAML.load_file('./data/references.yml')
catalogue = YAML.load_file('./data/catalogue.yml')
keys = ['bibliography', 'parallels']

catalogue.each do |e|
  references.each do |r|
    ref_name = r['name']
    ref_id   = r['id']

    keys.each do |k|
      # Check each desired key of each catalogue entry hash for a match to the
      # :name field among any of the reference # authors.
      next if e[k].nil?
        m = e[k].match(/#{ref_name}/)
        next if m.nil?

        # If a match is found, wrap it in a link to the :id of the matched author.
        e[k].gsub!(m[0], "<a href='../../bibliography/##{ref_id}'>#{m[0]}</a>")
    end
  end
end

# first_five = catalogue[0..4]
# puts first_five.to_yaml

File.open('./data/catalogue.yml', 'w') { |f| f.puts catalogue.to_yaml }
