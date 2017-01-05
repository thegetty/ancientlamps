#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'

references = YAML.load_file('./data/references.yml')
catalogue = YAML.load_file('./data/catalogue.yml')
keys = ['bibliography', 'parallels']

# Wrap the Catalogue.yml bib references in links
catalogue.each do |e|
  references.each do |r|
    ref_name = r['name']
    ref_id   = r['id']
    regex    = /#{ref_name}(?!I)/

    keys.each do |k|
      # Check each desired key of each catalogue entry hash for a match to the
      # :name field among any of the reference # authors.
      next if e[k].nil?
        m = e[k].match(regex)
        next if m.nil?

        # If a match is found, wrap it in a link to the :id of the matched author.
        e[k].gsub!(m[0], "<a href='../../bibliography/##{ref_id}'>#{m[0]}</a>")
    end
  end
end

# Write the file (uncomment when using)
# File.open('./data/catalogue.yml', 'w') { |f| f.puts catalogue.to_yaml }

# Wrap the Essay references in links
essays = Dir.glob(["source/**/*.html.md", "source/**/*.html.md.erb"])
essays.each do |essay|
  essay_text = File.read(essay)
  references.each do |r|
    ref_name = r['name']
    ref_id   = r['id']
    regex    = /#{ref_name}(?!I)/

    # Check the text of each essay for a match to the :name field of the references
    m = essay_text.match(regex)
    next if m.nil?

    # If a match is found, wrap it in a link to the :id of the matched author.
    essay_text.gsub!(m[0], "<a href='../../bibliography/##{ref_id}'>#{m[0]}</a>")
  end

  # Write the file (uncomment when using)
  # File.open(essay, 'w') { |f| f.puts essay_text }
  puts essay_text
end
