<template lang="pug">
  div.category-list.card(v-if="categories.length > 0")
    h3.title Category
    ul
      li(v-for="category in categories"): router-link(:to="'/category/' + category") {{ category }}
</template>

<script>
export default {
  name: 'CategoriesList',
  asyncData ({ store, state }) {
    return store.dispatch('fetchCategory');
  },
  computed: {
    categories () { return this.$store.state.categories; }
  }
};
</script>

<style lang="scss">
@import '../style/global.scss';

div.category-list {
  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: block;
    font-size: 1em;
    height: 2em;
    line-height: 2em;
    padding-left: 1em;
    transition: background ease 0.5s;

    a {
      display: block;
    }

    a:hover {
      border: none;
    }
  }

  li:hover {
    cursor: pointer;
    background: mix($background_color, lightgrey, 80%);
    transition: background ease 0.1s;
  }
}
</style>
