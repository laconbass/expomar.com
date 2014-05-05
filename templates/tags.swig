{% macro a(href, caption, level) %}
  <a href="{{ href }}"{{ selected( breadcumbs[level] && breadcumbs[level].url == href ) }}>{{ caption }}</a>
{% endmacro %}
