const { createApp, ref, computed, onMounted } = Vue

const app = createApp({
    setup() {
        const characters = ref([])
        const searchText = ref('')
        const filterAlive = ref(false)
        const totalCharacters = ref(0)
        const currentPage = ref('home')
        const selectedCharacter = ref(null)
        const favorites = ref([])
        const currentPageNumber = ref(1)
        const totalPages = ref(0)

        const fetchCharacters = async (page = 1) => {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                characters.value = data.results
                totalCharacters.value = data.info.count
                totalPages.value = data.info.pages
                currentPageNumber.value = page
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        onMounted(() => {
            fetchCharacters()
            const storedFavorites = localStorage.getItem('favorites')
            if (storedFavorites) {
                favorites.value = JSON.parse(storedFavorites)
            }
        })

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
            if (!favorites.value.some(fav => fav.id === character.id)) {
                favorites.value.push(character)
                saveFavorites()
            }
        }

        const removeFromFavorites = (character) => {
            favorites.value = favorites.value.filter(fav => fav.id !== character.id)
            saveFavorites()
        }

        const saveFavorites = () => {
            localStorage.setItem('favorites', JSON.stringify(favorites.value))
        }

        const openFavoritesModal = () => {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'))
            modal.show()
        }

        const goToPage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                fetchCharacters(page)
            }
        }

        const paginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentPageNumber.value - 2); i <= Math.min(totalPages.value, currentPageNumber.value + 2); i++) {
                range.push(i)
            }
            return range
        })

        return {
            characters,
            searchText,
            filterAlive,
            totalCharacters,
            currentPage,
            selectedCharacter,
            favorites,
            currentPageNumber,
            totalPages,
            filteredCharacters,
            showDetails,
            addToFavorites,
            removeFromFavorites,
            openFavoritesModal,
            goToPage,
            paginationRange
        }
    }
})

app.mount('#app')