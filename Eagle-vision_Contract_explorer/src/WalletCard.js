import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Box,
  AppBar,
  Toolbar,
  Container,
  Paper,
  Divider,
  Alert,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Lock as LockIcon,
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  FormatListBulleted as ListIcon,
} from "@mui/icons-material";

const contractAddress = "0xdd6d5C01939E79AeD74686095898b42038D9e4F9";
const contractABI = [
  "function createCase(string,string,string) public",
  "function addEvidence(string,string,string,uint256) public",
  "function addQuery(string,string,uint256) public",
  "function closeCase(uint256) public",
  "function assignAuthority(uint256,address) public",
  "function getCase(uint256) view returns (uint256,string,string,string,bool)",
  "function getEvidences(uint256) view returns (tuple(uint256,string,string,string)[])",
  "function getQueries(uint256) view returns (tuple(uint256,string,string)[])",
  "function getAuthorities(uint256) view returns (address[])",
  "function getTotalCases() view returns (uint256)",
];

const ZenSafe = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [isLoading, setIsLoading] = useState(false);

  // UI State Management
  const [activeTab, setActiveTab] = useState(0);
  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    content: "",
  });

  // Form Data
  const [caseData, setCaseData] = useState({
    location: "",
    videoHash: "",
    dateTime: "",
  });
  const [caseId, setCaseId] = useState("");
  const [evidenceData, setEvidenceData] = useState({
    mediaHash: "",
    description: "",
    dateTime: "",
  });
  const [queryData, setQueryData] = useState({ question: "", answer: "" });
  const [authorityAddress, setAuthorityAddress] = useState("");
  const [caseDetails, setCaseDetails] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) connectWallet();
      });
      window.ethereum.on("accountsChanged", connectWallet);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const showResult = (title, content) => {
    setResultDialog({
      open: true,
      title,
      content:
        typeof content === "string"
          ? content
          : JSON.stringify(content, null, 2),
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum)
      return showResult("Error", "MetaMask not detected. Please install it.");

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await providerInstance.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signerInstance
      );
      const networkData = await providerInstance.getNetwork();

      setProvider(providerInstance);
      setSigner(signerInstance);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setNetwork(networkData.name);
      setStatus("connected");
    } catch (err) {
      console.error("Connection error:", err);
      showResult("Connection Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const executeContractMethod = async (method, params, successMessage) => {
    if (!contract) {
      showResult("Error", "Please connect your wallet first");
      return false;
    }

    setIsLoading(true);
    try {
      const tx = await contract[method](...params);
      await tx.wait();
      showResult("Success", successMessage);
      return true;
    } catch (err) {
      console.error(err);
      showResult("Error", err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeContractQuery = async (method, params) => {
    if (!contract) {
      showResult("Error", "Please connect your wallet first");
      return null;
    }

    setIsLoading(true);
    try {
      const result = await contract[method](...params);
      return result;
    } catch (err) {
      console.error(err);
      showResult("Error", err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Case Methods
  const createCase = async () => {
    const { location, videoHash, dateTime } = caseData;
    if (!location || !videoHash || !dateTime) {
      showResult("Error", "Please fill in all fields");
      return;
    }

    const success = await executeContractMethod(
      "createCase",
      [location, videoHash, dateTime],
      "Case created successfully!"
    );

    if (success) {
      setCaseData({ location: "", videoHash: "", dateTime: "" });
      // Refresh total cases
      getTotalCases();
    }
  };

  const getCase = async (id = caseId) => {
    if (!id) {
      showResult("Error", "Please enter a Case ID");
      return;
    }

    const result = await executeContractQuery("getCase", [id]);
    if (result) {
      const caseInfo = {
        id: result[0].toString(),
        location: result[1],
        videoHash: result[2],
        dateTime: result[3],
        isOpen: result[4],
      };

      setCaseDetails(caseInfo);

      showResult(
        "Case Details",
        `
        Case ID: ${caseInfo.id}
        Location: ${caseInfo.location}
        Video Hash: ${caseInfo.videoHash}
        Date/Time: ${caseInfo.dateTime}
        Status: ${caseInfo.isOpen ? "Open" : "Closed"}
      `
      );
    }
  };

  const addEvidence = async () => {
    const { mediaHash, description, dateTime } = evidenceData;
    if (!mediaHash || !description || !dateTime || !caseId) {
      showResult("Error", "Please fill in all evidence fields and Case ID");
      return;
    }

    const success = await executeContractMethod(
      "addEvidence",
      [mediaHash, description, dateTime, caseId],
      "Evidence added successfully!"
    );

    if (success) {
      setEvidenceData({ mediaHash: "", description: "", dateTime: "" });
    }
  };

  const addQuery = async () => {
    const { question, answer } = queryData;
    if (!question || !answer || !caseId) {
      showResult("Error", "Please fill in all query fields and Case ID");
      return;
    }

    const success = await executeContractMethod(
      "addQuery",
      [question, answer, caseId],
      "Query added successfully!"
    );

    if (success) {
      setQueryData({ question: "", answer: "" });
    }
  };

  const closeCase = async () => {
    if (!caseId) {
      showResult("Error", "Please enter a Case ID");
      return;
    }

    await executeContractMethod(
      "closeCase",
      [caseId],
      "Case closed successfully!"
    );
  };

  const assignAuthority = async () => {
    if (!caseId || !authorityAddress) {
      showResult("Error", "Please enter Case ID and Authority Address");
      return;
    }

    const success = await executeContractMethod(
      "assignAuthority",
      [caseId, authorityAddress],
      "Authority assigned successfully!"
    );

    if (success) {
      setAuthorityAddress("");
    }
  };

  const getEvidences = async () => {
    if (!caseId) {
      showResult("Error", "Please enter a Case ID");
      return;
    }

    const result = await executeContractQuery("getEvidences", [caseId]);
    if (result) {
      const formattedResult = result.map((item) => ({
        id: item[0].toString(),
        mediaHash: item[1],
        description: item[2],
        dateTime: item[3],
      }));

      showResult("Evidence List", formattedResult);
    }
  };

  const getQueries = async () => {
    if (!caseId) {
      showResult("Error", "Please enter a Case ID");
      return;
    }

    const result = await executeContractQuery("getQueries", [caseId]);
    if (result) {
      const formattedResult = result.map((item) => ({
        id: item[0].toString(),
        question: item[1],
        answer: item[2],
      }));

      showResult("Query List", formattedResult);
    }
  };

  const getAuthorities = async () => {
    if (!caseId) {
      showResult("Error", "Please enter a Case ID");
      return;
    }

    const result = await executeContractQuery("getAuthorities", [caseId]);
    if (result) {
      showResult("Authorities", result.join("\n"));
    }
  };

  const getTotalCases = async () => {
    const result = await executeContractQuery("getTotalCases", []);
    if (result) {
      showResult(
        "Total Cases",
        `There are currently ${result.toString()} cases in the system.`
      );
    }
  };

  // Tab panels
  const tabPanels = [
    // Dashboard
    <Box key="dashboard" p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Case Management
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="Case ID"
                variant="outlined"
                fullWidth
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                size="small"
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => getCase()}
                startIcon={<SearchIcon />}
              >
                Load
              </Button>
            </Box>

            {caseDetails && (
              <Alert
                severity={caseDetails.isOpen ? "info" : "success"}
                icon={caseDetails.isOpen ? <FolderIcon /> : <LockIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  Case #{caseDetails.id} - {caseDetails.location}
                </Typography>
                <Typography variant="body2">
                  Status: {caseDetails.isOpen ? "Open" : "Closed"} • Date:{" "}
                  {caseDetails.dateTime}
                </Typography>
              </Alert>
            )}

            <Box display="flex" mt={2}>
              <Button
                variant="outlined"
                startIcon={<ListIcon />}
                onClick={getTotalCases}
                sx={{ mr: 1 }}
              >
                Total Cases
              </Button>
              {caseId && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<LockIcon />}
                  onClick={closeCase}
                  disabled={caseDetails && !caseDetails.isOpen}
                >
                  Close Case
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            {caseId && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FolderIcon />}
                      onClick={getEvidences}
                    >
                      View Evidence
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<SearchIcon />}
                      onClick={getQueries}
                    >
                      View Queries
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AssignmentIcon />}
                      onClick={getAuthorities}
                    >
                      View Authorities
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={() => setActiveTab(2)}
                    >
                      Add Evidence
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Case
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Location"
              fullWidth
              value={caseData.location}
              onChange={(e) =>
                setCaseData({ ...caseData, location: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Video Hash"
              fullWidth
              value={caseData.videoHash}
              onChange={(e) =>
                setCaseData({ ...caseData, videoHash: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Date/Time (e.g., 2025-03-21 17:30)"
              fullWidth
              value={caseData.dateTime}
              onChange={(e) =>
                setCaseData({ ...caseData, dateTime: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={createCase}
              startIcon={<AddIcon />}
            >
              Create New Case
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>,

    // Authorities
    <Box key="authorities" p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assign Authority
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Case ID"
              fullWidth
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Authority Address"
              fullWidth
              value={authorityAddress}
              onChange={(e) => setAuthorityAddress(e.target.value)}
              placeholder="0x..."
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={assignAuthority}
              startIcon={<AssignmentIcon />}
              disabled={!caseId || !authorityAddress}
            >
              Assign Authority
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {caseId && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Current Authorities</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={getAuthorities}
            >
              Refresh
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="outlined"
            fullWidth
            onClick={getAuthorities}
            startIcon={<ListIcon />}
          >
            View Assigned Authorities
          </Button>
        </Paper>
      )}
    </Box>,

    // Evidence
    <Box key="evidence" p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Evidence
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Case ID"
              fullWidth
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date/Time"
              fullWidth
              value={evidenceData.dateTime}
              onChange={(e) =>
                setEvidenceData({ ...evidenceData, dateTime: e.target.value })
              }
              placeholder="YYYY-MM-DD HH:MM"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Media Hash"
              fullWidth
              value={evidenceData.mediaHash}
              onChange={(e) =>
                setEvidenceData({ ...evidenceData, mediaHash: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={evidenceData.description}
              onChange={(e) =>
                setEvidenceData({
                  ...evidenceData,
                  description: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={addEvidence}
              startIcon={<AddIcon />}
              disabled={
                !caseId ||
                !evidenceData.mediaHash ||
                !evidenceData.description ||
                !evidenceData.dateTime
              }
            >
              Add Evidence
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {caseId && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Evidence Records</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={getEvidences}
            >
              Refresh
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="outlined"
            fullWidth
            onClick={getEvidences}
            startIcon={<ListIcon />}
          >
            View Evidence Records
          </Button>
        </Paper>
      )}
    </Box>,

    // Queries
    <Box key="queries" p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Query
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Case ID"
              fullWidth
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Question"
              fullWidth
              multiline
              rows={2}
              value={queryData.question}
              onChange={(e) =>
                setQueryData({ ...queryData, question: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Answer"
              fullWidth
              multiline
              rows={3}
              value={queryData.answer}
              onChange={(e) =>
                setQueryData({ ...queryData, answer: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={addQuery}
              startIcon={<AddIcon />}
              disabled={!caseId || !queryData.question || !queryData.answer}
            >
              Add Query
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {caseId && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Query History</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={getQueries}
            >
              Refresh
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="outlined"
            fullWidth
            onClick={getQueries}
            startIcon={<ListIcon />}
          >
            View Query History
          </Button>
        </Paper>
      )}
    </Box>,
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            🛡️ ZenSafe
          </Typography>

          {account ? (
            <Chip
              icon={<WalletIcon />}
              label={`${account.slice(0, 6)}...${account.slice(-4)}`}
              color="secondary"
              variant="outlined"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={connectWallet}
              startIcon={<WalletIcon />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Connect Wallet"}
            </Button>
          )}
        </Toolbar>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          variant="fullWidth"
          textColor="inherit"
          sx={{ bgcolor: "rgba(0,0,0,0.1)" }}
        >
          <Tab label="Dashboard" />
          <Tab label="Authorities" />
          <Tab label="Evidence" />
          <Tab label="Queries" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!account ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Welcome to ZenSafe
            </Typography>
            <Typography variant="body1" paragraph>
              ZenSafe is a blockchain-based crime lifecycle management system.
              Please connect your wallet to get started.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={connectWallet}
              startIcon={<WalletIcon />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Connect MetaMask"}
            </Button>
          </Paper>
        ) : (
          tabPanels[activeTab]
        )}
      </Container>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog.open}
        onClose={() => setResultDialog({ ...resultDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{resultDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
          >
            {resultDialog.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResultDialog({ ...resultDialog, open: false })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Processing blockchain transaction...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ZenSafe;
