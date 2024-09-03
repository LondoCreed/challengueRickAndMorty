const { createApp, ref, computed } = Vue

const Home = {
    template: '#home-template',
    setup() {
        const characters = ref([])
        const searchText = ref('')
        const filterAlive = ref(false)

        const fetchCharacters = async () => {
            try {
                const response = await fetch('https://rickandmortyapi.com/api/character')
                const data = await response.json()
                characters.value = data.results
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

        return {
            characters,
            searchText,
            filterAlive,
            filteredCharacters,
            showDetails,
            addToFavorites
        }
    }
}

const Stats = {
    template: '#stats-template',
    setup() {
        const totalCharacters = ref(0)

        const fetchStats = async () => {
            try {
                const response = await fetch('https://rickandmortyapi.com/api/character')
                const data = await response.json()
                totalCharacters.value = data.info.count
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()

        return {
            totalCharacters
        }
    }
}

const app = createApp({
    setup() {
        const currentPage = ref('home')
        
        const showFavorites = () => {
            console.log('Mostrar favoritos')
        }

        return {
            currentPage,
            showFavorites
        }
    },
    components: {
        home: Home,
        stats: Stats
    }
})

app.mount('#app')