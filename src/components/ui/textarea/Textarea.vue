<script setup>
import { cn } from '@/lib/utils';
import { useVModel } from '@vueuse/core';

const props = defineProps({
  class: { type: null, required: false },
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
});

const emits = defineEmits(['update:modelValue']);

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="
      cn(
        'tailwind.config.jsflex tailwind.config.jsmin-h-20 tailwind.config.jsw-full tailwind.config.jsrounded-md tailwind.config.jsborder tailwind.config.jsborder-input tailwind.config.jsbg-background tailwind.config.jspx-3 tailwind.config.jspy-2 tailwind.config.jstext-sm tailwind.config.jsring-offset-background placeholder:tailwind.config.jstext-muted-foreground focus-visible:tailwind.config.jsoutline-none focus-visible:tailwind.config.jsring-2 focus-visible:tailwind.config.jsring-ring focus-visible:tailwind.config.jsring-offset-2 disabled:tailwind.config.jscursor-not-allowed disabled:tailwind.config.jsopacity-50',
        props.class,
      )
    "
  />
</template>
