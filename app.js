const { createApp, ref, computed, onMounted, watch } = Vue

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
        const episodes = ref([])
        const currentEpisodePage = ref(1)
        const totalEpisodePages = ref(0)

        // Nuevas variables para estadísticas
        const topLocations = ref([])
        const statusCount = ref({})
        const speciesCount = ref({})
        const genderCount = ref({})

        const fetchCharacters = async (page = 1) => {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                characters.value = data.results
                totalCharacters.value = data.info.count
                totalPages.value = data.info.pages
                currentPageNumber.value = page
                calculateStats() // Llamada a la nueva función de estadísticas
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        const loadEpisodes = async (page = 1) => {
            console.log('Loading episodes for page:', page);
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`);
                const data = await response.json();
                episodes.value = data.results;
                totalEpisodePages.value = data.info.pages;
                currentEpisodePage.value = page;
            } catch (error) {
                console.error('Error fetching episodes:', error);
            }
        }

        // Nueva función para calcular estadísticas
        const calculateStats = () => {
            statusCount.value = characters.value.reduce((acc, char) => {
                acc[char.status] = (acc[char.status] || 0) + 1;
                return acc;
            }, {});

            speciesCount.value = characters.value.reduce((acc, char) => {
                acc[char.species] = (acc[char.species] || 0) + 1;
                return acc;
            }, {});

            const locationCount = characters.value.reduce((acc, char) => {
                acc[char.location.name] = (acc[char.location.name] || 0) + 1;
                return acc;
            }, {});
            topLocations.value = Object.entries(locationCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }));

            genderCount.value = characters.value.reduce((acc, char) => {
                acc[char.gender] = (acc[char.gender] || 0) + 1;
                return acc;
            }, {});
        }

        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.search)
            const page = urlParams.get('page')

            if (page === 'episodes') {
                currentPage.value = 'episodes'
                loadEpisodes(1)
            } else {
                fetchCharacters()
            }

            const storedFavorites = localStorage.getItem('favorites')
            if (storedFavorites) {
                favorites.value = JSON.parse(storedFavorites)
            }
        })

        watch(() => currentPage.value, (newValue) => {
            console.log('Current Page:', newValue);
            if (newValue === 'episodes') {
                loadEpisodes(1);
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

        const isFavorite = (character) => {
            return favorites.value.some(fav => fav.id === character.id)
        }

        const toggleFavorite = (character) => {
            if (isFavorite(character)) {
                removeFromFavorites(character)
            } else {
                addToFavorites(character)
            }
        }

        const addToFavorites = (character) => {
            if (!isFavorite(character)) {
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

        const goToEpisodePage = (page) => {
            if (page >= 1 && page <= totalEpisodePages.value) {
                loadEpisodes(page)
            }
        }

        const paginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentPageNumber.value - 2); i <= Math.min(totalPages.value, currentPageNumber.value + 2); i++) {
                range.push(i)
            }
            return range
        })

        const episodePaginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentEpisodePage.value - 2); i <= Math.min(totalEpisodePages.value, currentEpisodePage.value + 2); i++) {
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
            paginationRange,
            episodes,
            currentEpisodePage,
            totalEpisodePages,
            loadEpisodes,
            goToEpisodePage,
            episodePaginationRange,
            // Nuevas propiedades para estadísticas
            topLocations,
            statusCount,
            speciesCount,
            genderCount,
            // Propiedades y métodos para favoritos
            isFavorite,
            toggleFavorite
        }
    }
})

app.mount('#app')
