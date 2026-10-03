# frozen_string_literal: true
#
# 새 글 파일을 만듭니다.
#
#   ruby scripts/new-post.rb "글 제목"
#   ruby scripts/new-post.rb "글 제목" --slug my-post --category Research --tags Claude,AI --subtitle "한 줄 요약"
#   ruby scripts/new-post.rb "글 제목" --draft        # _drafts/ 에 날짜 없이 생성
#
# 생성되는 것: _posts/YYYY-MM-DD-slug.md (또는 _drafts/slug.md) + assets/images/posts/slug/ 폴더
#
require 'optparse'
require 'date'
require 'fileutils'

ARGV.map! { |a| a.dup.force_encoding('UTF-8') }

opts = { category: 'Full-Stack', tags: [], draft: false, slug: nil, subtitle: '', template: 'post' }
parser = OptionParser.new do |o|
  o.banner = '사용법: ruby scripts/new-post.rb "글 제목" [옵션]'
  o.on('--slug SLUG', '파일명·URL 에 쓸 영문 slug (기본: 제목의 영문·숫자 단어)') { |v| opts[:slug] = v }
  o.on('--category NAME', '기획 | Full-Stack | AI/ML | Life (기본 Full-Stack)') { |v| opts[:category] = v }
  o.on('--tags A,B', Array, '태그 (쉼표 구분)') { |v| opts[:tags] = v }
  o.on('--subtitle TEXT', '카드·상단에 보이는 한 줄 요약') { |v| opts[:subtitle] = v }
  o.on('--template NAME', '템플릿 _templates/NAME.md (기본 post)') { |v| opts[:template] = v }
  o.on('--draft', '_drafts/ 에 생성 (serve --drafts 로만 보임)') { opts[:draft] = true }
end
parser.parse!

title = ARGV.join(' ').strip
abort(parser.help) if title.empty?

root = File.expand_path('..', __dir__)
slug = opts[:slug] || title.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/\A-|-\z/, '')
if slug.empty?
  slug = "post-#{Time.now.strftime('%H%M%S')}"
  warn "제목에 영문·숫자가 없어 slug 를 #{slug} 로 정했습니다. 주소를 예쁘게 하려면 --slug my-post 를 함께 주세요."
end
dir  = opts[:draft] ? '_drafts' : '_posts'
name = opts[:draft] ? "#{slug}.md" : "#{Date.today}-#{slug}.md"
path = File.join(root, dir, name)
abort("이미 있습니다: #{dir}/#{name}") if File.exist?(path)

tags = opts[:tags].map(&:strip).reject(&:empty?)

# 템플릿(_templates/post.md)의 {{...}} 자리를 채웁니다. 머리말(제목·소제목·카테고리·태그)도 템플릿 안에 있습니다.
tpl_path = File.join(root, '_templates', "#{opts[:template]}.md")
abort("템플릿이 없습니다: _templates/#{opts[:template]}.md") unless File.exist?(tpl_path)
yaml_str = ->(s) { s.to_s.gsub('\\', '\\\\\\\\').gsub('"', '\\"') }
content = File.read(tpl_path, encoding: 'UTF-8')
  .gsub('{{title}}', yaml_str.call(title))
  .gsub('{{subtitle}}', yaml_str.call(opts[:subtitle]))
  .gsub('{{category}}', opts[:category])
  .gsub('{{tags}}', tags.join(', '))
  .gsub('{{slug}}', slug)

FileUtils.mkdir_p(File.dirname(path))
File.write(path, content, encoding: 'UTF-8')

img_dir = File.join(root, 'assets', 'images', 'posts', slug)
FileUtils.mkdir_p(img_dir)

puts "생성: #{dir}/#{name}  (템플릿: _templates/#{File.basename(tpl_path)})"
puts "이미지 폴더: assets/images/posts/#{slug}/  → 본문에서 ![설명](/assets/images/posts/#{slug}/파일명.png)"
puts(opts[:draft] ? '미리보기: bundle exec jekyll serve --livereload --drafts' : '미리보기: bundle exec jekyll serve --livereload')
puts "발행(초안일 때): ruby scripts/publish-draft.rb #{slug}" if opts[:draft]
