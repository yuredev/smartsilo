<template>
    <div>
        {{type}}
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            required: true
        }
    }
}
</script>