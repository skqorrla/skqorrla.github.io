# frozen_string_literal: true
#
# 초안을 발행합니다: _drafts/slug.md → _posts/YYYY-MM-DD-slug.md (오늘 날짜)
#
#   ruby scripts/publish-draft.rb slug
#   ruby scripts/publish-draft.rb slug --date 2026-10-05
#
require 'optparse'
require 'date'
require 'fileutils'

ARGV.map! { |a| a.dup.force_encoding('UTF-8') }

date = Date.today
parser = OptionParser.new do |o|
  o.banner = '사용법: ruby scripts/publish-draft.rb slug [--date YYYY-MM-DD]'
  o.on('--date DATE', '발행 날짜 (기본 오늘)') { |v| date = Date.parse(v) }
end
parser.parse!

slug = ARGV.first.to_s.sub(/\.md\z/, '').strip
abort(parser.help) if slug.empty?

root = File.expand_path('..', __dir__)
from = File.join(root, '_drafts', "#{slug}.md")
to   = File.join(root, '_posts', "#{date}-#{slug}.md")
abort("초안이 없습니다: _drafts/#{slug}.md") unless File.exist?(from)
abort("이미 있습니다: _posts/#{date}-#{slug}.md") if File.exist?(to)

FileUtils.mkdir_p(File.dirname(to))
FileUtils.mv(from, to)
puts "발행: _posts/#{date}-#{slug}.md  (주소: /#{date}/#{slug}/)"
puts '푸시하면 GitHub Actions 가 배포합니다: git add -A && git commit -m "post: ..." && git push'
