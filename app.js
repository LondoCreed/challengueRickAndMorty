const { createApp, ref, computed } = Vue

const app = createApp({
    setup() {
        const characters = ref([])
        const searchText = ref('')
        const filterAlive = ref(false)
        const totalCharacters = ref(0)

        const fetchCharacters = async () => {
            try {
                const response = await fetch('https://rickandmortyapi.com/api/character')
                const data = await response.json()
                characters.value = data.results
                totalCharacters.value = data.info.count
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        fetchCharacters()

        const filteredCharacters = computed(() => {
            return characters.value.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(searchText.value.toLowerCase())
                const matchesFilter = !filterAlive.value || character.status === 'Alive'
                return matchesSearch && matchesFilter
            })
        })

        const showDetails = (character) => {
            console.log('Mostrar detalles de:', character.name)
        }

        const addToFavorites = (character) => {
            console.log('Añadir a favoritos:', character.name)
        }

        const currentPage = ref('home')
        
        const showFavorites = () => {
            console.log('Mostrar favoritos')
        }

        return {
            characters,
            searchText,
            filterAlive,
            filteredCharacters,
            showDetails,
            addToFavorites,
            currentPage,
            showFavorites,
            totalCharacters
        }
    }
})

app.mount('#app')