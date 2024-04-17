<template>
  <q-page class="flex flex-center">


    <q-btn @click='printerStore.addFileToStorage(file)'>
      Добавить файл в статистику
    </q-btn>
    <br>



    <div class="q-pa-md">
      <div class="q-gutter-md row items-start">
        <q-input
          @update:model-value="val => { file = val[0] }"
          filled
          type="file"
          hint="Native file"
        />
      </div>
    </div>
    <br>




  </q-page>
</template>

<script>
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';
import { ref } from 'vue'


export default {
  name: "addFileToStorage",
  setup(){
    const printerStore=usePrinterStore();
    const {printers}=storeToRefs(printerStore);
    return {
      printerStore,
      printers,
      file: ref(null),
    }
  },
};
</script>



<style scoped>

</style>
