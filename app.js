const { createApp, ref, computed } = Vue

const app = createApp({
    setup() {
        const characters = ref([])
        const searchText = ref('')
        const filterAlive = ref(false)
        const totalCharacters = ref(0)
        const currentPage = ref('home')
        const selectedCharacter = ref(null)
        const currentPageNumber = ref(1) // Página actual
        const totalPages = ref(0) // Total de páginas

        const fetchCharacters = async (page = 1) => {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                characters.value = data.results
                totalCharacters.value = data.info.count
                totalPages.value = data.info.pages // Total de páginas
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        // Fetch initial data
        fetchCharacters(currentPageNumber.value)

        const filteredCharacters = computed(() => {
            return characters.value.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(searchText.value.toLowerCase())
                const matchesFilter = !filterAlive.value || character.status === 'Alive'
                return matchesSearch && matchesFilter
            })
        })

        const showDetails = (character) => {
            selectedCharacter.value = character
            currentPage.value = 'details'
        }


        const addToFavorites = (character) => {
            console.log('Añadir a favoritos:', character.name)
        }

        const showFavorites = () => {
            console.log('Mostrar favoritos')
        }

        const goToPage = (pageNumber) => {
            if (pageNumber >= 1 && pageNumber <= totalPages.value) {
                currentPageNumber.value = pageNumber
                fetchCharacters(pageNumber)
            }
        }

        const paginationRange = computed(() => {
            const range = []
            const maxPagesToShow = 5 // Mostrar solo 5 páginas a la vez

            let start = Math.max(currentPageNumber.value - Math.floor(maxPagesToShow / 2), 1)
            let end = Math.min(start + maxPagesToShow - 1, totalPages.value)

            if (end - start < maxPagesToShow - 1) {
                start = Math.max(end - maxPagesToShow + 1, 1)
            }

            for (let i = start; i <= end; i++) {
                range.push(i)
            }

            return range
        })

        return {
            characters,
            searchText,
            filterAlive,
            filteredCharacters,
            showDetails,
            addToFavorites,
            currentPage,
            showFavorites,
            totalCharacters,
            selectedCharacter,
            currentPageNumber,
            totalPages,
            goToPage,
            paginationRange
        }
    }
})

app.mount('#app')
