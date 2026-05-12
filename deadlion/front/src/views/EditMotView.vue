<template>
  <div class="edit-container">
    <div class="edit-header">
      <button class="blue-button" @click="router.push('/home')">
        Back
      </button>
      <button class="green-button" @click="saveMot">
        Save
      </button>
    </div>

    <div class="edit-group">
      <div class="edit-field">
        <label>Title</label>
        <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
        <input v-model="form.title" class="basic-input" />
      </div>

      <div class="edit-field">
        <label>Description</label>
        <div v-if="errors.descr" class="error-message">{{ errors.descr }}</div>
        <textarea v-model="form.descr" class="basic-input"></textarea>
      </div>

      <div class="edit-field">
        <label>ASI (in days)</label>
        <div v-if="errors.asi" class="error-message">{{ errors.asi }}</div>
        <input v-model.number="form.asi" class="basic-input" type="number" step="0.1" />
      </div>
    </div>
    <button class="red-button" @click="deleteMotCallback">
      Delete
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMots } from '../composables/useMots'
import type { Mot } from '../types/types'

const router = useRouter()
const route = useRoute()
const { getMot, updateMot, deleteMot } = useMots()

const motId = Number(route.params.id)
const form = reactive<Mot>({
  title: '',
  descr: '',
  asi: 1.0
})

const errors = reactive({
  title: '',
  descr: '',
  asi: ''
})

onMounted(async () => {
  const mot = await getMot(motId)
  if (mot) {
    form.title = mot.title
    form.descr = mot.descr
    form.asi = mot.asi
  } else {
    router.push('/home')
  }
})

const validate = (): boolean => {
  errors.title = ''
  errors.descr = ''
  errors.asi = ''

  const titleLen = form.title.trim().length
  if (titleLen < 1 || titleLen > 1000) {
    errors.title = 'Title length must be not empty and less than 1000 symbols'
  }

  const descrLen = form.descr.trim().length
  if (descrLen < 1 || descrLen > 100000) {
    errors.descr = 'Description length must be not empty and less than 100000 symbols'
  }

  if (form.asi < 0.01 || form.asi > 3650.0 || isNaN(form.asi)) {
    errors.asi = 'Average sending interval must be in range 0.01..3650.0 (from ~15 mins to ~10 years)'
  }

  return !errors.title && !errors.descr && !errors.asi
}

const saveMot = async () => {
  if (!validate()) return

  await updateMot(motId, {
    title: form.title.trim(),
    descr: form.descr.trim(),
    asi: form.asi
  })

  router.push('/home')
}

const deleteMotCallback = async () => {
  await deleteMot(motId)

  router.push('/home')
}
</script>