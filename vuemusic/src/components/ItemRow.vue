<template>
    <perfect-scrollbar class="item-container">
        <div class="column" v-for="(itemGroup, i) in itemGroups"
             :class="{last: i===items.length-1}">
            <item-square v-for="item in itemGroup"
                          :big="big"
                          :small="small"
                          :show-year="showYear"
                          class="single-item"
                          :item="item"></item-square>
        </div>
    </perfect-scrollbar>
</template>

<script>
    import ItemSquare from "./ItemSquare";

    export default {
        name: "ItemRow",
        components: {ItemSquare},
        props: {
            items: {
                type: Array,
                default: () => [],
            },
            small: {
                type: Boolean,
                default: false,
            },
            big: {
                type: Boolean,
                default: false,
            },
            rows: {
                type: Number,
                default: 1,
            },
            showYear: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            itemGroups() {
                let groups = [];
                for (let i = 0; i < this.items.length; i += this.rows) {
                    groups.push(this.items.slice(i, i + this.rows));
                }
                return groups;
            }
        }
    }
</script>

<style scoped>
    .item-container {
        position: relative;
        width: 100%;
        display: flex;
        padding: 0 15px;
        padding-bottom: 15px;
    }

    .single-item {
        display: inline-block;
        margin: 5px 15px;
    }

    .single-item.last {
        padding-right: 30px;
    }

</style>