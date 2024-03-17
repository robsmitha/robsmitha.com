<template>
    <!-- <HelloWorld 
        text="Search Code" 
        :actions="actions" 
        src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/code-dark.jpg"
        :height="300"
    /> -->
    <CodeSearch />
</template>

<script lang="ts" setup>
const actions = [
  { text: 'Documentation', href: 'https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code' }
]

</script>
  