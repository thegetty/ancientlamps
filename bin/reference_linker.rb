#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'
references = YAML.load_file('./data/references.yml')

def add_catalogue_yaml_links
  catalogue = YAML.load_file('./data/catalogue.yml')
  keys = ['bibliography', 'parallels']

  catalogue.each do |e|
    references.each do |r|
      ref_name = r['name']
      ref_id   = r['id']
      regex    = /#{ref_name}(?!I)/

      keys.each do |k|
        next if e[k].nil?
          m = e[k].match(regex)
          next if m.nil?
          e[k].gsub!(m[0], "<a href='../../bibliography/##{ref_id}'>#{m[0]}</a>")
      end
    end
  end

  File.open('./data/catalogue.yml', 'w') { |f| f.puts catalogue.to_yaml }
end

def add_catalogue_essay_links
  essays = Dir.glob(["source/catalogue/**/*.html.md", "source/catalogue/**/*.html.md.erb"])
  essays.each do |essay|
    essay_text = File.read(essay)
    references.each do |r|
      ref_name = r['name']
      ref_id   = r['id']
      regex    = /#{ref_name}(?!I)/
      m = essay_text.match(regex)
      next if m.nil?
      essay_text.gsub!(m[0], "<a href='../../bibliography/##{ref_id}'>#{m[0]}</a>")
    end
    File.open(essay, 'w') { |f| f.puts essay_text }
  end
end

def add_top_level_essay_links
  essays = Dir.glob(["source/*.html.md", "source/*.html.md.erb"])
  essays.each do |essay|
    essay_text = File.read(essay)
    references.each do |r|
      ref_name = r['name']
      ref_id   = r['id']
      regex    = /#{ref_name}(?!I)/
      m = essay_text.match(regex)
      next if m.nil?
      essay_text.gsub!(m[0], "<a href='../bibliography/##{ref_id}'>#{m[0]}</a>")
    end
    File.open(essay, 'w') { |f| f.puts essay_text }
  end
end

# Uncomment methods if you want to use them
# add_catalogue_yaml_links
# add_catalogue_essay_links
# add_top_level_essay_links
