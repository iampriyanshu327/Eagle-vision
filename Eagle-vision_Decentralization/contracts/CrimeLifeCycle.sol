// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrimeLifeCycle {
    uint256 private caseCounter = 0;

    mapping(uint256 => CrimeCase) public caseIdToCrime;

    struct CrimeCase {
        uint256 caseId;
        string location;
        string videoHash;
        string dateTime;
        bool isCaseOpen;
        Evidence[] evidences;
        Query[] queries;
        address[] authorities;
        uint256 evidenceCounter;
        uint256 queryCounter;
    }

    struct Evidence {
        uint256 evidenceId;
        string mediaHash;
        string description;
        string dateTime;
    }

    struct Query {
        uint256 queryId;
        string question;
        string answer;
    }

    // ========== MODIFIER TO CHECK AUTHORITY ==========
    modifier onlyAuthorized(uint256 _caseId) {
        require(_caseId < caseCounter, "Invalid case ID");
        bool isAuthorized = false;
        for (uint i = 0; i < caseIdToCrime[_caseId].authorities.length; i++) {
            if (caseIdToCrime[_caseId].authorities[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Not an authorized user for this case");
        _;
    }

    function testLog() public pure returns (string memory) {
        return "Hello solidity";
    }

    // ========== CREATE A NEW CASE ==========
    function createCase(
        string memory _location,
        string memory _videoHash,
        string memory _dateTime
    ) public {
        CrimeCase storage newCase = caseIdToCrime[caseCounter];
        newCase.caseId = caseCounter;
        newCase.location = _location;
        newCase.videoHash = _videoHash;
        newCase.dateTime = _dateTime;
        newCase.isCaseOpen = true;
        newCase.evidenceCounter = 0;
        newCase.queryCounter = 0;
        newCase.authorities.push(msg.sender);
        caseCounter++;
    }

    // ========== ADD EVIDENCE ==========
    function addEvidence(
        string memory _mediaHash,
        string memory _description,
        string memory _dateTime,
        uint256 _caseId
    ) public onlyAuthorized(_caseId) {
        require(caseIdToCrime[_caseId].isCaseOpen, "Case is closed");

        CrimeCase storage currentCase = caseIdToCrime[_caseId];

        Evidence memory newEvidence = Evidence({
            evidenceId: currentCase.evidenceCounter,
            mediaHash: _mediaHash,
            description: _description,
            dateTime: _dateTime
        });

        currentCase.evidences.push(newEvidence);
        currentCase.evidenceCounter++;
    }

    // ========== ADD QUERY ==========
    function addQuery(
        string memory _question,
        string memory _answer,
        uint256 _caseId
    ) public onlyAuthorized(_caseId) {
        CrimeCase storage currentCase = caseIdToCrime[_caseId];

        Query memory newQuery = Query({
            queryId: currentCase.queryCounter,
            question: _question,
            answer: _answer
        });

        currentCase.queries.push(newQuery);
        currentCase.queryCounter++;
    }

    // ========== CLOSE CASE ==========
    function closeCase(uint256 _caseId) public onlyAuthorized(_caseId) {
        require(caseIdToCrime[_caseId].isCaseOpen, "Case already closed");
        caseIdToCrime[_caseId].isCaseOpen = false;
    }

    // ========== ASSIGN AUTHORITIES ==========
    function assignAuthority(
        uint256 _caseId,
        address _authority
    ) public onlyAuthorized(_caseId) {
        caseIdToCrime[_caseId].authorities.push(_authority);
    }

    // ========== GET CASE DETAILS ==========
    function getCase(
        uint256 _caseId
    )
        public
        view
        onlyAuthorized(_caseId)
        returns (uint256, string memory, string memory, string memory, bool)
    {
        CrimeCase storage c = caseIdToCrime[_caseId];
        return (c.caseId, c.location, c.videoHash, c.dateTime, c.isCaseOpen);
    }

    // ========== GET EVIDENCES FOR A CASE ==========
    function getEvidences(
        uint256 _caseId
    ) public view onlyAuthorized(_caseId) returns (Evidence[] memory) {
        return caseIdToCrime[_caseId].evidences;
    }

    // ========== GET QUERIES FOR A CASE ==========
    function getQueries(
        uint256 _caseId
    ) public view onlyAuthorized(_caseId) returns (Query[] memory) {
        return caseIdToCrime[_caseId].queries;
    }

    // ========== GET AUTHORITIES ASSIGNED TO A CASE ==========
    function getAuthorities(
        uint256 _caseId
    ) public view onlyAuthorized(_caseId) returns (address[] memory) {
        return caseIdToCrime[_caseId].authorities;
    }

    // ========== GET TOTAL CASE COUNT ==========
    function getTotalCases() public view returns (uint256) {
        return caseCounter;
    }
}
