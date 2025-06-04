---
title: <%*
let title = await tp.system.prompt("블로그 제목 입력 (필수):");
tR += title;
%>
publish: true

subtitle: <%*
let subtitle = await tp.system.prompt("부제목 입력 (선택):");
tR += subtitle;
%>
description: <%*
let description = await tp.system.prompt("게시물 설명 입력 (150-160자 권장):");
tR += description;
%>

meta_title: <%*
let meta_title = await tp.system.prompt("SEO 메타 제목 입력 (비워두면 title 사용):");
tR += meta_title;
%>
meta_description: <%*
let meta_description = await tp.system.prompt("SEO 메타 설명 입력 (비워두면 description 사용):");
tR += meta_description;
%>
keywords: <%*
let keywords = await tp.system.prompt("키워드 입력 (콤마로 구분):");
let keywordList = keywords.split(",").map(k => `  - ${k.trim()}`).join("\n");
tR += "\n" + keywordList;
%>

og_title: <%*
let og_title = await tp.system.prompt("소셜 미디어 제목 입력 (비워두면 meta_title/title 사용):");
tR += og_title;
%>
og_description: <%*
let og_description = await tp.system.prompt("소셜 미디어 설명 입력 (비워두면 meta_description/description 사용):");
tR += og_description;
%>
og_type: article
twitter_card: summary_large_image

created_date: <% tp.date.now %>
featured_image: <%*
let featured_image = await tp.system.prompt("대표 이미지 URL 입력 (선택):");
tR += featured_image;
%>
featured_image_alt: <%*
let featured_image_alt = "";
if (featured_image) {
  featured_image_alt = await tp.system.prompt("대표 이미지 대체 텍스트 입력 (필수):");
}
tR += featured_image_alt;
%>

slug: <%*
let slug = await tp.system.prompt("사용자 지정 URL 경로 입력 (비워두면 제목으로 자동 생성):");
tR += slug;
%>
tags: <%*
let tags = await tp.system.prompt("태그 입력 (콤마로 구분):");
let tagList = tags.split(",").map(t => `  - ${t.trim()}`).join("\n");
tR += "\n" + tagList;
%>
---

<!-- 여기에 블로그 게시물 콘텐츠 작성 시작 -->
