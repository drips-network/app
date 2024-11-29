<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  export let text = '';
  $: words = text.split(' ');
  let typedWords: string[] = [];

  export let wordClasses = '';

  const dispatch = createEventDispatcher();

  const speed = 80;
  let done = false;
  let currentIndex = 0;
  let currentWordIndex = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const typeNextCharacter = () => {
    if (currentIndex < words[currentWordIndex].length) {
      currentIndex++;
    } else {
      if (typedWords.length === words.length - 1) {
        clearTimeout(timeout);
        done = true;
        dispatch('done');
        return;
      }
      typedWords.push(words[currentWordIndex]);
      typedWords = typedWords;
      currentIndex = 0;
      currentWordIndex = (currentWordIndex + 1) % words.length;
    }
    timeout = setTimeout(typeNextCharacter, speed);
  };

  onMount(() => {
    timeout = setTimeout(typeNextCharacter, speed);
  });

  onDestroy(() => clearTimeout(timeout));
</script>

{@html '&nbsp;'}{#each typedWords as word}<span class="inline-block {wordClasses}"
    >{word}&nbsp;</span
  >{/each}<span class="inline-block {wordClasses}"
  >{words[currentWordIndex].slice(0, currentIndex)}<span class:animate-blink={done}>|</span></span
>
